"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboard,
  faTriangleExclamation,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import Breadcrumbs from "@/components/breadcrumbs_nav";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useReport } from '@/hooks/swr';
import BackButton from "@/components/buttons/back_button";
import Image from "next/image";
import StatusBox from "@/components/tiles/status_tile";
import ConfirmModal from "@/components/modals/confirmation_modal";
import RequestRevisionModal from "@/components/modals/request_revision_modal";

export default function ViewReport() {
  const searchParams = useSearchParams();
  const reportId = searchParams.get("id");

  // SWR: fetch report
  const { data: reportRes, isLoading: loading, error: swrError } = useReport(reportId ?? undefined);
  const reportData = reportRes?.data ?? null;
  const error = swrError ? (swrError instanceof Error ? swrError.message : 'Failed to load report') : null;

  const reportedUserId = useMemo(() => {
    const v = reportData?.reported_user_id?.trim();
    return v || '(N/A)';
  }, [reportData]);

  const reporterId = useMemo(() => {
    const v = reportData?.reporter_id?.trim();
    return v || 'N/A';
  }, [reportData]);

  const dateReported = useMemo(() => {
    if (reportData?.created_at) return new Date(reportData.created_at as string).toLocaleDateString();
    const metaDate = reportData?.metadata?.created_at;
    if (metaDate && typeof metaDate === 'object' && 'seconds' in metaDate) return new Date(metaDate.seconds * 1000).toLocaleDateString();
    return 'N/A';
  }, [reportData]);

  const userIssue = reportData?.title || reportData?.reason || 'Inappropriate Content Posted';
  const reasonDescription = reportData?.description || reportData?.details || 'The user has posted content that violates the community guidelines by sharing offensive images and language.';
  const additionalInfo = reportData?.description || reportData?.details || 'The user has posted content that violates the community guidelines by sharing offensive images and language. This behavior has been reported multiple times by other users, and it is affecting the overall experience of the platform. Immediate action is required to address this issue and ensure a safe environment for all users.';

  const userProfileImage = "/assets/sdssdsd.jpg";
  const title =
    "The Rise of Molds: Dive into the Microscopic Landscape of Growing Fungi";
  const content =
    "Molds are a fascinating group of fungi that thrive in diverse environments, from damp basements to decaying organic matter. These microscopic organisms play a crucial role in ecosystems by breaking down complex organic materials, recycling nutrients, and contributing to soil health...";
  const userRole = "Administrator";

  const [imgSrc, setImgSrc] = useState(userProfileImage);
  const [hasImage, setHasImage] = useState(true);
  const [isRejectModalOpen, setRejectModalOpen] = useState(false);
  const [isReqRevisionsModalOpen, setIsReqRevisionsModalOpen] = useState(false);
  const [reportActionLoading, setReportActionLoading] = useState(false);
  const [reportStatus, setReportStatus] = useState("Unresolved");
  const [isResolved, setIsResolved] = useState(false); 

  const imageSrc = hasImage
    ? "/assets/f0779092-c074-46cc-883a-700fafb86a53.png"
    : null;

  /** Handles rejecting a report */
  const handleReject = async () => {
    setReportStatus("Rejected");
    setRejectModalOpen(false);
    setIsResolved(true);
  };

  /** Handles requesting revision with additional details */
  const handleSubmit = async (details: string) => {
    setReportActionLoading(true);
    try {
      setReportStatus("Revision Requested");
      setIsReqRevisionsModalOpen(false);
      setIsResolved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setReportActionLoading(false);
    }
  };

  return (
    <main className="relative flex flex-col xl:py-2 py-10 w-full max-w-none overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-row justify-between mb-10">
        <div className="flex flex-col">
          <Breadcrumbs role={userRole} />
          <h1 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black text-3xl">
            REPORTS
          </h1>
        </div>
      </div>

      <BackButton />

      {loading && <p className="text-center">Loading report...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && !error && (
        <>

      {/* User Info */}
      <div className="flex flex-col md:flex-row w-full gap-x-4 items-center">
        
        {/* The profile picture of the user that is reported */}
        <div className="w-50 aspect-square rounded-full overflow-hidden shadow-sm flex-shrink-0 relative">
          <Image
            src={imgSrc}
            alt="profile picture"
            fill
            className="object-cover rounded-full"
            onError={() => setImgSrc("/assets/default-fallback.png")}
          />
        </div>

        <div className="flex flex-col items-center md:items-start justify-center w-full">
          <p className="mt-2 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">
            Reported User ID:
          </p>

          {/* The reported_user_id from the report */}
          <div className="flex flex-col md:flex-row items-center md:items-start mb-2">
            <h1 className="font-[family-name:var(--font-montserrat)] text-2xl font-black text-[var(--primary-color)] mr-5">
              {reportedUserId === '(N/A)' ? (
                <span className="text-[var(--moldify-red)] text-lg">{reportedUserId}</span>
              ) : (
                reportedUserId
              )}
            </h1>
            {/*  Automatically shows “Resolved” once a decision is made */}
            <StatusBox status={isResolved ? "Resolved" : reportStatus} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-10 gap-y-6 my-3 w-full">

            {/* The reporter_id */}
            <div className="flex flex-col items-center md:items-start">
              <p className="text-sm text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)]">
                Reporter ID:
              </p>
              <h2 className="text-lg font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">
                {reporterId}
              </h2>
            </div>

            {/* Date Reported */}
            <div className="flex flex-col items-center md:items-start">
              <p className="text-sm text-[var(--primary-color)] font-[family-name:var(--font-bricolage-grotesque)]">
                Date Reported:
              </p>
              <h2 className="text-lg font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-bold">
                {dateReported}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Report Section */}
      <div className="flex flex-col lg:flex-row w-full max-w-full mt-10 md:gap-10">
        {/* LEFT SIDE */}
        <div className="w-full lg:w-1/4 flex flex-col min-w-0">
          {reportStatus === "Rejected" ? (
            <div className="flex gap-x-2 items-center justify-center bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 font-[family-name:var(--font-bricolage-grotesque)] font-bold text-sm text-center">
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className="text-red-600 text-xl mb-1"
              />
              This report is rejected
            </div>
          ) : reportStatus === "Revision Requested" ? (
            <div className="flex gap-x-2items-center justify-center bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-lg p-4 font-[family-name:var(--font-bricolage-grotesque)] font-bold text-sm text-center">
              <FontAwesomeIcon
                icon={faClipboard}
                className="text-yellow-600 text-xl mb-1"
              />
              This report is requested for revision
            </div>
          ) : (
            <>
              {/* Request Revision Button */}
              <button
                type="button"
                className="text-sm cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--primary-color)] text-[var(--background-color)] py-2 rounded-lg hover:bg-[var(--hover-primary)] transition"
                onClick={() => setIsReqRevisionsModalOpen(true)}
              >
                Request Revision
              </button>
               {/* Reject Report Button */}
              <button
                type="button"
                className="text-sm cursor-pointer font-[family-name:var(--font-bricolage-grotesque)] bg-[var(--moldify-red)] text-[var(--background-color)] py-2 rounded-lg hover:bg-red-600 transition mt-2"
                onClick={() => setRejectModalOpen(true)}
              >
                Reject Report
              </button>
            </>
          )}

          {/* Issue description */}
          <p className="mt-5 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">
            Issue:
          </p>
          <h2 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black">
            {userIssue}
          </h2>

          {/* Additional information */}
          <p className="mt-5 text-sm font-[family-name:var(--font-bricolage-grotesque)] text-[var(--primary-color)]">
            Additional Information:
          </p>
          <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-justify">
            {additionalInfo}
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full lg:w-3/4 bg-[var(--taupe)] rounded-xl py-4 px-6 mt-10 md:mt-0 h-auto min-w-0">
          <h2 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black mb-3 text-sm">
            Reported Content
          </h2>

          {/* Report image or placeholder */}
          <div className="relative w-full h-40 md:h-52 lg:h-60 rounded-lg overflow-hidden bg-[var(--moldify-softGrey)] flex items-center justify-center">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt="Report image"
                fill
                className="object-cover"
                onError={() => setHasImage(false)}
                priority
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-[var(--moldify-grey)] opacity-70">
                <FontAwesomeIcon
                  icon={faImage}
                  className="text-3xl mb-2 text-[var(--moldify-black)] opacity-60"
                />
                <p className="text-sm font-[family-name:var(--font-bricolage-grotesque)]">
                  No Image Available
                </p>
              </div>
            )}
          </div>
          {/* Reported content title & description */}
          <h2 className="font-[family-name:var(--font-montserrat)] text-[var(--primary-color)] font-black my-3">
            {title}
          </h2>
          <p className="font-[family-name:var(--font-bricolage-grotesque)] text-[var(--moldify-black)] text-justify">
            {content}
          </p>
        </div>
      </div>

      {/* MODALS */}
      <ConfirmModal
        isOpen={isRejectModalOpen}
        title="Are you sure you want to reject this report?"
        subtitle="This action is permanent and cannot be undone."
        cancelText="Cancel"
        confirmText="Yes"
        onCancel={() => setRejectModalOpen(false)}
        onConfirm={handleReject}
      />

      <RequestRevisionModal
        isOpen={isReqRevisionsModalOpen}
        onClose={() => setIsReqRevisionsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={reportActionLoading}
        reasonTitle={userIssue}
        reasonDescription={reasonDescription}
      />
        </>
      )}
    </main>
  );
}
