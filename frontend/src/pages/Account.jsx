import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  UserRound,
  Mail,
  ShieldCheck,
  CalendarDays,
  LogOut,
  Camera,
  TicketPercent,
  Gift,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { reportClientIssue } from "../lib/clientLogger";
import { supabase } from "../lib/supabaseClient";
import {
  getMyVouchers,
  redeemVoucher,
} from "../services/api";

import ConfirmModal from "../components/ConfirmModal";

import "./Account.css";


export default function Account() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const voucherLoadAbortRef =
    useRef(null);
  const uploadLockRef =
    useRef(false);
  const redeemLockRef =
    useRef(false);
  const logoutLockRef =
    useRef(false);

  const {
    user,
    profile,
    isAdmin,
    signOut,
  } = useAuth();

  const [avatarUrl, setAvatarUrl] =
    useState(profile?.avatar_url || "");

  const [
    uploadingAvatar,
    setUploadingAvatar,
  ] = useState(false);

  const [
    voucherCode,
    setVoucherCode,
  ] = useState("");

  const [
    voucherMessage,
    setVoucherMessage,
  ] = useState("");

  const [
    voucherError,
    setVoucherError,
  ] = useState("");

  const [
    redeeming,
    setRedeeming,
  ] = useState(false);

  const [
    vouchers,
    setVouchers,
  ] = useState([]);

  const [
    loadingVouchers,
    setLoadingVouchers,
  ] = useState(true);

  const [
    voucherLoadError,
    setVoucherLoadError,
  ] = useState("");

  const [
    logoutModalOpen,
    setLogoutModalOpen,
  ] = useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const [
    logoutError,
    setLogoutError,
  ] = useState("");


  useEffect(() => {
    setAvatarUrl(
      profile?.avatar_url || ""
    );
  }, [profile]);


  useEffect(() => {
    if (isAdmin) {
      voucherLoadAbortRef
        .current
        ?.abort();

      voucherLoadAbortRef.current =
        null;

      setLoadingVouchers(false);
      return undefined;
    }

    loadVouchers();

    return () => {
      voucherLoadAbortRef
        .current
        ?.abort();
    };
  }, [isAdmin]);


  async function loadVouchers() {
    voucherLoadAbortRef
      .current
      ?.abort();

    const controller =
      new AbortController();

    voucherLoadAbortRef.current =
      controller;

    try {
      setLoadingVouchers(true);
      setVoucherLoadError("");

      const data =
        await getMyVouchers({
          signal:
            controller.signal,
        });

      if (
        controller.signal.aborted
      ) {
        return;
      }

      setVouchers(
        data.vouchers || []
      );
    } catch (error) {
      if (
        controller.signal.aborted
      ) {
        return;
      }

      reportClientIssue(
        "Unable to load vouchers:",
        error
      );

      setVoucherLoadError(
        error?.message ||
          "Unable to load your vouchers."
      );
    } finally {
      if (
        voucherLoadAbortRef.current ===
        controller
      ) {
        voucherLoadAbortRef.current =
          null;

        if (
          !controller.signal.aborted
        ) {
          setLoadingVouchers(false);
        }
      }
    }
  }


  async function handleAvatarChange(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file || !user) {
      return;
    }

    if (uploadLockRef.current) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      alert(
        "Please upload a JPG, PNG, or WebP image."
      );

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "Profile picture must be 5 MB or smaller."
      );

      return;
    }

    uploadLockRef.current =
      true;

    try {
      setUploadingAvatar(true);

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      const filePath =
        `${user.id}/avatar.${extension}`;

      const {
        error: uploadError,
      } = await supabase
        .storage
        .from("avatars")
        .upload(
          filePath,
          file,
          {
            upsert: true,
            contentType:
              file.type,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data:
          publicUrlData,
      } = supabase
        .storage
        .from("avatars")
        .getPublicUrl(
          filePath
        );

      const newAvatarUrl =
        `${publicUrlData.publicUrl}?v=${Date.now()}`;

      const {
        error: profileError,
      } = await supabase
        .from("profiles")
        .update({
          avatar_url:
            newAvatarUrl,

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          user.id
        );

      if (profileError) {
        throw profileError;
      }

      setAvatarUrl(
        newAvatarUrl
      );
    } catch (error) {
      reportClientIssue(
        "Avatar upload error:",
        error
      );

      alert(
        error.message ||
          "Unable to upload profile picture."
      );
    } finally {
      uploadLockRef.current =
        false;

      setUploadingAvatar(false);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    }
  }


  async function handleRedeemVoucher(
    event
  ) {
    event.preventDefault();

    if (redeemLockRef.current) {
      return;
    }

    const code =
      voucherCode
        .trim()
        .toUpperCase();

    if (!code) {
      setVoucherError(
        "Enter a voucher code."
      );

      return;
    }

    if (code.length > 50) {
      setVoucherError(
        "Voucher code is too long."
      );

      return;
    }

    redeemLockRef.current =
      true;

    try {
      setRedeeming(true);
      setVoucherError("");
      setVoucherMessage("");

      const data =
        await redeemVoucher(
          code
        );

      if (!data?.success) {
        setVoucherError(
          data?.message ||
            "Unable to redeem voucher."
        );

        return;
      }

      setVoucherMessage(
        data.message ||
          "Voucher redeemed successfully!"
      );

      setVoucherCode("");

      await loadVouchers();
    } catch (error) {
      setVoucherError(
        error?.message ||
          "Unable to redeem voucher."
      );
    } finally {
      redeemLockRef.current =
        false;

      setRedeeming(false);
    }
  }


  function openLogoutModal() {
    setLogoutError("");
    setLogoutModalOpen(true);
  }


  async function handleLogout() {
    if (logoutLockRef.current) {
      return;
    }

    logoutLockRef.current =
      true;

    try {
      setLoggingOut(true);
      setLogoutError("");

      await signOut();

      setLogoutModalOpen(
        false
      );

      navigate(
        "/",
        {
          replace: true,
        }
      );
    } catch (error) {
      reportClientIssue(
        "Logout error:",
        error
      );

      setLogoutError(
        error?.message ||
          "Unable to log out. Please try again."
      );
    } finally {
      logoutLockRef.current =
        false;

      setLoggingOut(false);
    }
  }


  function formatDate(date) {
    if (!date) {
      return "Not available";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-PH",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  }


  function formatDiscount(
    voucher
  ) {
    if (!voucher) {
      return "";
    }

    if (
      voucher.discountType ===
      "percentage"
    ) {
      return `${Number(
        voucher.discountValue
      )}% OFF`;
    }

    return `₱${Number(
      voucher.discountValue
    ).toLocaleString()} OFF`;
  }


  return (
    <>
      <div className="container account-page">
        <div className="account-hero">
          <span className="eyebrow">
            Your Account
          </span>

          <h1>
            Hi,{" "}
            {profile?.full_name ||
              "Traveler"}
          </h1>

          <p>
            Manage your profile,
            trips, vouchers, and
            AddyVenture rewards.
          </p>
        </div>


        <div className="account-grid">
          <section className="account-card">
            <div className="account-profile">
              <div className="account-avatar">
                {avatarUrl ? (
                  <img
                    src={
                      avatarUrl
                    }
                    alt="Profile"
                    className="account-avatar__image"
                    decoding="async"
                    width="110"
                    height="110"
                  />
                ) : (
                  <div className="account-avatar__placeholder">
                    <UserRound
                      size={44}
                    />
                  </div>
                )}

                <button
                  type="button"
                  className="account-avatar__button"
                  title="Change profile picture"
                  aria-label="Change profile picture"
                  disabled={
                    uploadingAvatar
                  }
                  onClick={() =>
                    fileInputRef
                      .current
                      ?.click()
                  }
                >
                  <Camera
                    size={17}
                  />
                </button>

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={
                    handleAvatarChange
                  }
                />
              </div>


              <div className="account-profile__details">
                <h2>
                  {profile?.full_name ||
                    "AddyVenture User"}
                </h2>

                <div className="account-role">
                  {uploadingAvatar
                    ? "Uploading photo..."
                    : `${
                        profile?.role ||
                        "client"
                      } account`}
                </div>
              </div>
            </div>


            <div className="account-info-grid">
              <div className="account-info-item">
                <Mail
                  size={18}
                />

                <strong>
                  Email
                </strong>

                <span>
                  {user?.email}
                </span>
              </div>


              <div className="account-info-item">
                <ShieldCheck
                  size={18}
                />

                <strong>
                  Account Type
                </strong>

                <span
                  style={{
                    textTransform:
                      "capitalize",
                  }}
                >
                  {profile?.role ||
                    "client"}
                </span>
              </div>


              <div className="account-info-item">
                <CalendarDays
                  size={18}
                />

                <strong>
                  Member Since
                </strong>

                <span>
                  {formatDate(
                    profile?.created_at
                  )}
                </span>
              </div>
            </div>
          </section>


          {!isAdmin && (
            <section className="account-card">
              <div>
                <span className="eyebrow">
                  AddyVenture Rewards
                </span>

                <h2>
                  <TicketPercent
                    size={24}
                    style={{
                      marginRight:
                        "0.5rem",

                      verticalAlign:
                        "middle",
                    }}
                  />

                  Vouchers &
                  Discounts
                </h2>

                <p>
                  Enter a voucher code
                  to add it to your
                  travel wallet.
                </p>
              </div>


              <form
                className="voucher-redeem"
                onSubmit={
                  handleRedeemVoucher
                }
              >
                <input
                  type="text"
                  value={
                    voucherCode
                  }
                  maxLength={50}
                  onChange={(
                    event
                  ) => {
                    setVoucherCode(
                      event.target.value
                        .toUpperCase()
                    );

                    setVoucherError(
                      ""
                    );

                    setVoucherMessage(
                      ""
                    );
                  }}
                  placeholder="Enter voucher code"
                  autoComplete="off"
                  disabled={
                    redeeming
                  }
                />

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    redeeming
                  }
                >
                  {redeeming
                    ? "Redeeming..."
                    : "Redeem Voucher"}
                </button>
              </form>


              {voucherMessage && (
                <p
                  className="voucher-message"
                  role="status"
                >
                  🎉{" "}
                  {
                    voucherMessage
                  }
                </p>
              )}


              {voucherError && (
                <p
                  className="account-error"
                  role="alert"
                >
                  {
                    voucherError
                  }
                </p>
              )}


              <div className="voucher-list">
                {loadingVouchers && (
                  <p>
                    Loading
                    vouchers...
                  </p>
                )}


                {!loadingVouchers &&
                  voucherLoadError && (
                    <p
                      className="account-error"
                      role="alert"
                    >
                      {
                        voucherLoadError
                      }
                    </p>
                  )}


                {!loadingVouchers &&
                  !voucherLoadError &&
                  vouchers.length ===
                    0 && (
                    <div>
                      <Gift
                        size={25}
                      />

                      <p>
                        No vouchers in
                        your wallet yet.
                      </p>
                    </div>
                  )}


                {vouchers.map(
                  (item) => {
                    const voucher =
                      item.voucher;

                    if (
                      !voucher
                    ) {
                      return null;
                    }

                    return (
                      <article
                        key={
                          item.id
                        }
                        className="voucher-card"
                      >
                        <div>
                          <strong>
                            {
                              voucher.title
                            }
                          </strong>

                          <p>
                            {
                              voucher.description
                            }
                          </p>

                          <span className="voucher-code">
                            {
                              voucher.code
                            }
                          </span>

                          <span className="voucher-status">
                            {
                              item.status
                            }
                          </span>
                        </div>


                        <div className="voucher-discount">
                          {formatDiscount(
                            voucher
                          )}

                          {Number(
                            voucher.minimumSpend
                          ) >
                            0 && (
                            <small
                              style={{
                                display:
                                  "block",

                                marginTop:
                                  "0.35rem",

                                fontFamily:
                                  "var(--font-body)",

                                fontWeight:
                                  400,

                                color:
                                  "var(--ink-soft)",
                              }}
                            >
                              Min. spend
                              ₱
                              {Number(
                                voucher.minimumSpend
                              ).toLocaleString()}
                            </small>
                          )}
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            </section>
          )}


          <section className="account-card">
            <h2>
              Quick Access
            </h2>

            <div className="account-actions">
              {!isAdmin && (
                <>
                  <Link
                    to="/my-bookings"
                    className="btn btn-primary"
                  >
                    My Bookings
                  </Link>

                  <Link
                    to="/plan-trip"
                    className="btn btn-secondary"
                  >
                    Plan a Trip
                  </Link>

                  <Link
                    to="/tours"
                    className="btn btn-secondary"
                  >
                    Explore Tours
                  </Link>
                </>
              )}


              {isAdmin && (
                <>
                  <Link
                    to="/admin/bookings"
                    className="btn btn-primary"
                  >
                    Manage Bookings
                  </Link>

                  <Link
                    to="/admin/messages"
                    className="btn btn-secondary"
                  >
                    Messages
                  </Link>
                </>
              )}


              <button
                type="button"
                className="btn btn-secondary"
                onClick={
                  openLogoutModal
                }
              >
                <LogOut
                  size={17}
                />
                Log Out
              </button>
            </div>


            {logoutError && (
              <p
                className="account-error"
                role="alert"
                style={{
                  marginTop:
                    "1rem",
                }}
              >
                {logoutError}
              </p>
            )}
          </section>


          <section className="account-card account-privacy-card">
            <div className="account-privacy-card__heading">
              <ShieldCheck
                size={24}
                aria-hidden="true"
              />

              <div>
                <span className="eyebrow">
                  Your Privacy
                </span>

                <h2>
                  Privacy &amp;
                  Account Data
                </h2>
              </div>
            </div>

            <p>
              Review how your data is
              handled or submit a
              verified request to
              access, correct, or
              delete eligible account
              information.
            </p>

            <div className="account-actions">
              <Link
                to="/privacy-policy"
                className="btn btn-secondary"
              >
                Privacy Policy
              </Link>

              <Link
                to="/contact"
                state={{
                  topic:
                    "Privacy or account data request",
                }}
                className="btn btn-secondary"
              >
                Submit Data Request
              </Link>
            </div>

            <p className="account-privacy-note">
              Requests are reviewed and
              identity-verified before
              any account data is
              changed or removed. Some
              transaction records may
              need to be retained.
            </p>
          </section>
        </div>
      </div>


      <ConfirmModal
        open={
          logoutModalOpen
        }
        title="Log out of AddyVenture?"
        message={
          isAdmin
            ? "You will be signed out of your administrator account and returned to the AddyVenture homepage."
            : "You will be signed out of your account and returned to the AddyVenture homepage."
        }
        confirmText="Log Out"
        cancelText="Stay Logged In"
        danger
        loading={
          loggingOut
        }
        onCancel={() => {
          if (
            !loggingOut
          ) {
            setLogoutModalOpen(
              false
            );

            setLogoutError(
              ""
            );
          }
        }}
        onConfirm={
          handleLogout
        }
      />
    </>
  );
}
