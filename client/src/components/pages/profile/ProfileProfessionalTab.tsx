"use client";

import { useDeleteResume, useUpdateProfile, useUploadResume, type ProfessionType } from "@/services/profile";
import { useAuthStore } from "@/store/auth";
import {
    Briefcase,
    Check,
    ExternalLink,
    FileText,
    Github,
    GraduationCap,
    Linkedin,
    Loader2,
    LogOut,
    SquarePen,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

// Extended user type for profile fields
interface ExtendedUser {
  profession?: ProfessionType;
  organization?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  resumeUrl?: string;
  resumeName?: string;
}

interface ProfessionalFormData {
  profession: ProfessionType;
  organization: string;
  linkedinUrl: string;
  githubUrl: string;
  resumeUrl: string;
  resumeName: string;
  resumeFilename?: string;
}

interface ProfileProfessionalTabProps {
  isEditing: boolean;
  onEdit: () => void;
  onLogout: () => void;
}

export default function ProfileProfessionalTab({
  isEditing,
  onEdit,
  onLogout,
}: ProfileProfessionalTabProps) {
  const { user } = useAuthStore();
  const resumeInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState<ProfessionalFormData>({
    profession: "student",
    organization: "",
    linkedinUrl: "",
    githubUrl: "",
    resumeUrl: "",
    resumeName: "",
  });
  
  // Resume upload state
  const [, setResumeFile] = useState<File | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Mutations
  const uploadResumeMutation = useUploadResume();
  const deleteResumeMutation = useDeleteResume();
  const updateProfileMutation = useUpdateProfile();

  // Initialize form data from user
  useEffect(() => {
    if (user) {
        console.log("Initializing professional form with user data:", user);
      setFormData({
        profession: user.profile?.profession as ProfessionType || "student",
        organization: user.profile?.organization || "",
        linkedinUrl: user.profile?.linkedinUrl || "",
        githubUrl: user.profile?.githubUrl || "",
        resumeUrl: user.profile?.resumeUrl || "",
        resumeName: user.profile?.resumeName || "",
        resumeFilename: user.profile?.resumeFilename || "",
      });
    }
  }, [user]);

  // Handle input changes
  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Handle resume file selection
  const handleResumeChange = useCallback(async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Resume must be less than 5MB");
      return;
    }

    setResumeFile(file);
    setIsUploadingResume(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await uploadResumeMutation.mutateAsync(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Update form data with uploaded resume
      setFormData(prev => ({
        ...prev,
        resumeUrl: result.url,
        resumeName: file.name,
      }));

      toast.success("Resume uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload resume");
      console.error("Resume upload error:", error);
    } finally {
      setIsUploadingResume(false);
      setUploadProgress(0);
      // Reset input
      if (resumeInputRef.current) {
        resumeInputRef.current.value = "";
      }
    }
  }, [uploadResumeMutation]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Create a synthetic event to reuse the handler
      const syntheticEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleResumeChange(syntheticEvent);
    }
  }, [handleResumeChange]);

  // Handle resume deletion
  const handleDeleteResume = useCallback(async () => {
    try {
      await deleteResumeMutation.mutateAsync();
      setFormData(prev => ({
        ...prev,
        resumeUrl: "",
        resumeName: "",
      }));
      toast.success("Resume deleted");
    } catch {
      toast.error("Failed to delete resume");
    }
  }, [deleteResumeMutation]);

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await updateProfileMutation.mutateAsync({
        profession: formData.profession as ProfessionType,
        organization: formData.organization,
        linkedinUrl: formData.linkedinUrl,
        githubUrl: formData.githubUrl,
      });
      toast.success("Professional info updated!");
      onEdit(); // Exit edit mode
    } catch {
      toast.error("Failed to update professional info");
    } finally {
      setIsSaving(false);
    }
  }, [formData, updateProfileMutation, onEdit]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    // Reset form to original values
    if (user) {
      const extUser = user as unknown as ExtendedUser;
      setFormData({
        profession: extUser.profession || "student",
        organization: extUser.organization || "",
        linkedinUrl: extUser.linkedinUrl || "",
        githubUrl: extUser.githubUrl || "",
        resumeUrl: extUser.resumeUrl || "",
        resumeName: extUser.resumeName || "",
      });
    }
    onEdit(); // Exit edit mode
  }, [user, onEdit]);
  return (
    <div className="bg-[#111111] border border-[#BF532B1A] rounded-[20px] p-6 sm:p-8 h-full min-h-[600px] shadow-[0_0_50px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#BF532B]/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10 relative z-10 w-full shrink-0">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-manrope font-medium text-white mb-2 tracking-tight">
            Professional Information
          </h1>
          <p className="text-white/40 text-[13px] font-manrope font-light tracking-wide">
            Your Career and Educational Background
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#161616] hover:bg-[#1E1E1E] border border-white/5 hover:border-white/10 text-white/70 rounded-xl transition-all text-xs font-manrope font-medium tracking-wide"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#BF532B] hover:bg-[#A64522] text-white rounded-xl transition-all text-xs font-manrope font-bold tracking-wide shadow-[0_4px_15px_-3px_rgba(191,83,43,0.4)] disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </>
          ) : (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#161616] hover:bg-[#1E1E1E] border border-white/5 hover:border-white/10 text-white/90 rounded-xl transition-all text-xs font-manrope font-medium tracking-wide group"
            >
              <SquarePen
                size={14}
                className="text-white/50 group-hover:text-white transition-colors"
              />
              <span>Edit Profile</span>
            </button>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1F120D] hover:bg-[#2A1810] border border-[#BF532B]/30 text-[#BF532B] rounded-xl transition-all text-xs font-manrope font-bold shadow-none"
          >
            <LogOut size={14} strokeWidth={2.5} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="overflow-y-auto pr-2 -mr-2 flex-1 space-y-10 relative z-10 custom-scrollbar">
        {/* Professional Information Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-[30px] h-[30px] rounded-[8px] bg-[#BF532B] text-white flex items-center justify-center shadow-[0_4px_10px_-2px_rgba(191,83,43,0.3)]">
              <Briefcase size={16} strokeWidth={2.5} />
            </div>
            <h2 className="text-[17px] font-manrope font-bold text-white tracking-wide">
              Career Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7 w-full">
            {/* Profession */}
            <div className="space-y-2">
              <label className="text-[13px] text-white/40 font-manrope font-medium pl-1 flex items-center gap-2">
                <Briefcase size={14} />
                Profession
              </label>
              <select
                name="profession"
                disabled={!isEditing}
                value={formData.profession}
                onChange={handleInputChange}
                className={`w-full bg-[#0A0A0A] border border-white/5 focus:border-[#BF532B]/50 rounded-xl px-4 py-3.5 text-white font-manrope font-medium focus:outline-none transition-all ${
                  !isEditing ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                <option value="student">Student</option>
                <option value="professional">Professional</option>
                <option value="freelancer">Freelancer</option>
                <option value="entrepreneur">Entrepreneur</option>
                <option value="job_seeker">Job Seeker</option>
              </select>
            </div>

            {/* Organization / College */}
            <div className="space-y-2">
              <label className="text-[13px] text-white/40 font-manrope font-medium pl-1 flex items-center gap-2">
                <GraduationCap size={14} />
                Organization / College
              </label>
              <input
                name="organization"
                disabled={!isEditing}
                value={formData.organization}
                onChange={handleInputChange}
                className={`w-full bg-[#0A0A0A] border border-white/5 focus:border-[#BF532B]/50 rounded-xl px-4 py-3.5 text-white font-manrope font-medium placeholder:text-white/20 focus:outline-none transition-all ${
                  !isEditing ? "cursor-not-allowed opacity-70" : ""
                }`}
                placeholder="Enter organization or college"
              />
            </div>
          </div>
        </section>

        {/* Resume Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-[30px] h-[30px] rounded-[8px] bg-[#BF532B] text-white flex items-center justify-center shadow-[0_4px_10px_-2px_rgba(191,83,43,0.3)]">
              <FileText size={16} strokeWidth={2.5} />
            </div>
            <h2 className="text-[17px] font-manrope font-bold text-white tracking-wide">
              Resume
            </h2>
          </div>

          {/* Resume Upload Area */}
          {isEditing ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => resumeInputRef.current?.click()}
              className={`w-full bg-[#0A0A0A] border-2 border-dashed rounded-xl px-6 py-8 transition-all cursor-pointer ${
                isDragging
                  ? "border-[#BF532B] bg-[#BF532B]/5"
                  : "border-white/10 hover:border-[#BF532B]/50"
              }`}
            >
              {isUploadingResume ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 size={32} className="text-[#BF532B] animate-spin" />
                  <div className="w-full max-w-xs">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#BF532B] transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-white/40 text-sm font-manrope mt-2 text-center">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                </div>
              ) : formData.resumeUrl ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#BF532B]/10 flex items-center justify-center">
                      <FileText size={24} className="text-[#BF532B]" />
                    </div>
                    <div>
                      <p className="text-white font-manrope font-medium">
                        {formData.resumeName || "Resume.pdf"}
                      </p>
                      <p className="text-white/40 text-sm font-manrope">
                        Click to replace or drag a new file
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={formData.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2.5 bg-[#161616] hover:bg-[#1E1E1E] border border-white/5 rounded-lg transition-all"
                    >
                      <ExternalLink size={16} className="text-white/70" />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteResume();
                      }}
                      className="p-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-[#BF532B]/10 flex items-center justify-center">
                    <Upload size={28} className="text-[#BF532B]" />
                  </div>
                  <div className="text-center">
                    <p className="text-white font-manrope font-medium">
                      Drop your resume here or click to browse
                    </p>
                    <p className="text-white/40 text-sm font-manrope mt-1">
                      PDF format only, max 5MB
                    </p>
                  </div>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={resumeInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleResumeChange}
                className="hidden"
              />
            </div>
          ) : formData.resumeUrl ? (
            <div className="w-full bg-[#0A0A0A] border border-[#BF532B]/30 rounded-xl px-4 sm:px-6 py-4">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    
    {/* Left Content */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#BF532B]/10 flex items-center justify-center shrink-0">
        <FileText size={20} className="text-[#BF532B] sm:size-6" />
      </div>

      <div className="min-w-0">
        <p className="text-white font-manrope font-medium text-sm sm:text-base truncate">
          {formData.resumeFilename || "Resume.pdf"}
        </p>
        <p className="text-white/40 text-xs sm:text-sm font-manrope">
          Your uploaded resume
        </p>
      </div>
    </div>

    {/* Action Button */}
    <Link
      href={formData.resumeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="
        w-full sm:w-auto
        flex items-center justify-center gap-2
        px-4 py-2.5
        bg-[#BF532B] hover:bg-[#A64522]
        text-white rounded-lg
        transition-all
        text-sm font-manrope font-medium
      "
    >
      <ExternalLink size={14} />
      View Resume
    </Link>

  </div>
</div>

          ) : (
            <div className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-6 py-8 text-center">
              <FileText size={32} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/40 font-manrope">No resume uploaded</p>
              <p className="text-white/20 text-sm font-manrope mt-1">
                Enable edit mode to upload your resume
              </p>
            </div>
          )}
        </section>

        {/* Social Links Section */}
        <section className="pb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-[30px] h-[30px] rounded-[8px] bg-[#BF532B] text-white flex items-center justify-center shadow-[0_4px_10px_-2px_rgba(191,83,43,0.3)]">
              <Linkedin size={16} strokeWidth={2.5} />
            </div>
            <h2 className="text-[17px] font-manrope font-bold text-white tracking-wide">
              Social Profiles
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7 w-full">
            {/* LinkedIn Profile */}
            <div className="space-y-2">
              <label className="text-[13px] text-white/40 font-manrope font-medium pl-1 flex items-center gap-2">
                <Linkedin size={14} />
                LinkedIn Profile
              </label>
              <input
                name="linkedinUrl"
                disabled={!isEditing}
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                className={`w-full bg-[#0A0A0A] border border-white/5 focus:border-[#BF532B]/50 rounded-xl px-4 py-3.5 text-white font-manrope font-medium placeholder:text-white/20 focus:outline-none transition-all ${
                  !isEditing ? "cursor-not-allowed opacity-70" : ""
                }`}
                placeholder="https://linkedin.com/in/username"
              />
              {!isEditing && formData.linkedinUrl && (
                <Link
                  href={formData.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#BF532B] text-xs font-manrope hover:underline inline-flex items-center gap-1 pl-1"
                >
                  Visit profile <ExternalLink size={10} />
                </Link>
              )}
            </div>

            {/* Github Profile */}
            <div className="space-y-2">
              <label className="text-[13px] text-white/40 font-manrope font-medium pl-1 flex items-center gap-2">
                <Github size={14} />
                Github Profile
              </label>
              <input
                name="githubUrl"
                disabled={!isEditing}
                value={formData.githubUrl}
                onChange={handleInputChange}
                className={`w-full bg-[#0A0A0A] border border-white/5 focus:border-[#BF532B]/50 rounded-xl px-4 py-3.5 text-white font-manrope font-medium placeholder:text-white/20 focus:outline-none transition-all ${
                  !isEditing ? "cursor-not-allowed opacity-70" : ""
                }`}
                placeholder="https://github.com/username"
              />
              {!isEditing && formData.githubUrl && (
                <Link
                  href={formData.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#BF532B] text-xs font-manrope hover:underline inline-flex items-center gap-1 pl-1"
                >
                  Visit profile <ExternalLink size={10} />
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
