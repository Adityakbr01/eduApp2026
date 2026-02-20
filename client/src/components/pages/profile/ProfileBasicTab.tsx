"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  PenLine,
  SquarePen,
  LogOut,
  MapPin,
  Camera,
  Loader2,
  X,
  Save,
} from "lucide-react";
import { useUploadAvatar, useUpdateProfile } from "@/services/profile";
import { useAuthStore } from "@/store/auth";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bio: string;
  city: string;
  state: string;
  country: string;
}

interface ProfileBasicTabProps {
  isEditing: boolean;
  onEdit: () => void;
  onLogout: () => void;
  onSave?: (data: ProfileFormData) => void;
}

export default function ProfileBasicTab({
  isEditing,
  onEdit,
  onLogout,
  onSave,
}: ProfileBasicTabProps) {
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Avatar upload mutation
  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useUploadAvatar();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  
  // Local avatar preview state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form state - initialize from user.profile if available
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.profile?.firstName || user?.name?.split(" ")[0] || "",
    lastName: user?.profile?.lastName || user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dateOfBirth: user?.profile?.dateOfBirth || "",
    bio: user?.profile?.bio || "",
    city: user?.profile?.city || user?.address || "",
    state: user?.profile?.state || "",
    country: user?.profile?.country || "",
  });

  // Sync form data when user data becomes available (async to avoid cascading renders)
  useEffect(() => {
    if (user) {
      // Defer state update to avoid synchronous setState in effect
      queueMicrotask(() => {
        setFormData((prev) => ({
          ...prev,
          firstName: user.profile?.firstName || user.name?.split(" ")[0] || prev.firstName,
          lastName: user.profile?.lastName || user.name?.split(" ").slice(1).join(" ") || prev.lastName,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
          dateOfBirth: user.profile?.dateOfBirth || prev.dateOfBirth,
          bio: user.profile?.bio || prev.bio,
          city: user.profile?.city || user.address || prev.city,
          state: user.profile?.state || prev.state,
          country: user.profile?.country || prev.country,
        }));
      });
    }
  }, [user]);

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle avatar file selection
  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Show local preview immediately
      const localUrl = URL.createObjectURL(file);
      setAvatarPreview(localUrl);
      setUploadProgress(0);

      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload to S3
      uploadAvatar(file, {
        onSuccess: (data) => {
          clearInterval(interval);
          setUploadProgress(100);
          console.log("Avatar uploaded successfully:", data);
          setAvatarPreview(data.url);
          setTimeout(() => setUploadProgress(0), 500);
        },
        onError: () => {
          clearInterval(interval);
          setUploadProgress(0);
          // Revert to previous avatar on error
          setAvatarPreview(null);
        },
      });
    },
    [uploadAvatar]
  );

  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    
    // Build payload, excluding empty values
    const payload: Record<string, string> = {};
    
    if (formData.firstName?.trim()) payload.firstName = formData.firstName.trim();
    if (formData.lastName?.trim()) payload.lastName = formData.lastName.trim();
    if (formData.dateOfBirth?.trim()) payload.dateOfBirth = formData.dateOfBirth.trim();
    if (formData.bio?.trim()) payload.bio = formData.bio.trim();
    if (formData.city?.trim()) payload.city = formData.city.trim();
    if (formData.state?.trim()) payload.state = formData.state.trim();
    if (formData.country?.trim()) payload.country = formData.country.trim();

    console.log("Profile update payload:", payload);
    
    updateProfile(payload, {
      onSuccess: () => {
        onEdit(); // Exit edit mode
      },
    });
  };

  const isSaving = isUpdating || isUploadingAvatar;

  return (
    <div className="bg-[#111111] border border-[#BF532B1A] rounded-[20px] p-6 sm:p-8 h-full min-h-[600px] shadow-[0_0_50px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#BF532B]/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10 relative z-10 w-full shrink-0">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-manrope font-medium text-white mb-2 tracking-tight">
            Personal Information
          </h1>
          <p className="text-white/40 text-[13px] font-manrope font-light tracking-wide">
            Update your personal details and contact information
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={onEdit}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-3 bg-[#161616] hover:bg-[#1E1E1E] border border-white/5 hover:border-white/10 text-white/70 rounded-xl transition-all text-sm font-manrope font-medium"
              >
                <X size={16} />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-[#BF532B] hover:bg-[#A64522] text-white rounded-xl transition-all text-sm font-manrope font-bold shadow-[0_4px_12px_rgba(191,83,43,0.3)] disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            </>
          ) : (
           <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
  
  {/* Edit Profile */}
  <button
    onClick={onEdit}
    className="
      w-full sm:w-auto
      flex items-center justify-center gap-2
      px-4 sm:px-6 py-3
      bg-[#161616] hover:bg-[#1E1E1E]
      border border-white/5 hover:border-white/10
      text-white/90 rounded-xl
      transition-all
      text-sm font-manrope font-medium tracking-wide
      group
    "
  >
    <SquarePen
      size={16}
      className="text-white/50 group-hover:text-white transition-colors"
    />
    <span>Edit Profile</span>
  </button>

  {/* Logout */}
  <button
    onClick={onLogout}
    className="
      w-full sm:w-auto
      flex items-center justify-center gap-2
      px-4 sm:px-6 py-3
      bg-[#1F120D] hover:bg-[#2A1810]
      border border-[#BF532B]/30
      text-[#BF532B]
      rounded-xl
      transition-all
      text-sm font-manrope font-bold
      active:scale-[0.97]
    "
  >
    <LogOut size={16} strokeWidth={2.5} />
    <span>Log Out</span>
  </button>

</div>

          )}
        </div>
      </div>

      {/* Form Content */}
      <div className="overflow-y-auto pr-2 -mr-2 flex-1 space-y-10 relative z-10 custom-scrollbar">
        {/* Profile Avatar Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-[30px] h-[30px] rounded-[8px] bg-[#BF532B] text-white flex items-center justify-center shadow-[0_4px_10px_-2px_rgba(191,83,43,0.3)]">
              <Camera size={16} strokeWidth={2.5} />
            </div>
            <h2 className="text-[17px] font-manrope font-bold text-white tracking-wide">
              Profile Photo
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar Preview */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-white/10 bg-[#0A0A0A]">
                {avatarPreview ? (
                  // Local blob preview - use img to avoid Next.js optimization issues
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreview}
                    alt="Profile avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : user?.avatar ? (
                  // Remote avatar URL - use img to avoid CloudFront proxy 403 errors
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt="Profile avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    <User size={48} />
                  </div>
                )}
              </div>
              
              {/* Upload Overlay */}
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  {isUploadingAvatar ? (
                    <Loader2 size={24} className="text-white animate-spin" />
                  ) : (
                    <Camera size={24} className="text-white" />
                  )}
                </button>
              )}
              
              {/* Upload Progress */}
              {isUploadingAvatar && (
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#BF532B] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Upload Info */}
            <div className="flex-1 text-center sm:text-left">
              <p className="text-white/60 text-sm font-manrope mb-2">
                {isEditing ? "Click on the image to upload a new photo" : "Enable edit mode to change your photo"}
              </p>
              <p className="text-white/30 text-xs font-manrope">
                Recommended: Square image, at least 256x256px. Max 5MB.
              </p>
              {isEditing && avatarPreview && (
                <button
                  onClick={() => {
                    setAvatarPreview(user?.avatar || null);
                  }}
                  className="mt-3 text-[#BF532B] text-sm font-manrope font-medium hover:underline flex items-center gap-1 mx-auto sm:mx-0"
                >
                  <X size={14} />
                  Reset to original
                </button>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </section>

        {/* Personal Information Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-[30px] h-[30px] rounded-[8px] bg-[#BF532B] text-white flex items-center justify-center shadow-[0_4px_10px_-2px_rgba(191,83,43,0.3)]">
              <User size={16} strokeWidth={2.5} />
            </div>
            <h2 className="text-[17px] font-manrope font-bold text-white tracking-wide">
              Personal Information
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7 w-full">
            {/* First Name */}
            <div className="space-y-2">
              <label className="text-[13px] text-white/40 font-manrope font-medium pl-1 flex items-center gap-2">
                <User size={14} />
                First Name
              </label>
              <input
                name="firstName"
                disabled={!isEditing}
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full bg-[#0A0A0A] border border-white/5 focus:border-[#BF532B]/50 rounded-xl px-4 py-3.5 text-white font-manrope font-medium placeholder:text-white/20 focus:outline-none transition-all ${
                  !isEditing ? "cursor-not-allowed opacity-70" : ""
                }`}
                placeholder="Enter first name"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="text-[13px] text-white/40 font-manrope font-medium pl-1 flex items-center gap-2">
                <User size={14} />
                Last Name
              </label>
              <input
                name="lastName"
                disabled={!isEditing}
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full bg-[#0A0A0A] border border-white/5 focus:border-[#BF532B]/50 rounded-xl px-4 py-3.5 text-white font-manrope font-medium placeholder:text-white/20 focus:outline-none transition-all ${
                  !isEditing ? "cursor-not-allowed opacity-70" : ""
                }`}
                placeholder="Enter last name"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[13px] text-white/40 font-manrope font-medium pl-1 flex items-center gap-2">
                <Mail size={14} />
                Email
              </label>
              <input
                disabled
                value={formData.email}
                className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3.5 text-white/50 font-manrope font-medium cursor-not-allowed opacity-70"
                placeholder="Email address"
              />
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <label className="text-[13px] text-white/40 font-manrope font-medium pl-1 flex items-center gap-2">
                <Phone size={14} />
                Contact
              </label>
              <input
                disabled
                value={formData.phone}
                className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-3.5 text-white/50 font-manrope font-medium cursor-not-allowed opacity-70"
                placeholder="Contact number"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2 col-span-1 sm:col-span-2">
              <label className="text-[13px] text-white/40 font-manrope font-medium pl-1 flex items-center gap-2">
                <Calendar size={14} />
                Date of Birth
              </label>
              <div className="relative cursor-pointer">
                <input
                  name="dateOfBirth"
                  disabled={!isEditing}
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={`w-full cursor-pointer bg-[#0A0A0A] border border-white/5 focus:border-[#BF532B]/50 rounded-xl px-4 py-3.5 text-white font-manrope font-medium placeholder:text-white/20 focus:outline-none transition-all block ${
                    !isEditing ? "cursor-not-allowed opacity-70" : ""
                  }`}
                  type="date"
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2 col-span-1 sm:col-span-2">
              <label className="text-[13px] text-white/40 font-manrope font-medium pl-1 flex items-center gap-2">
                <PenLine size={14} />
                Bio
              </label>
              <textarea
                name="bio"
                disabled={!isEditing}
                value={formData.bio}
                onChange={handleInputChange}
                maxLength={500}
                className={`w-full bg-[#0A0A0A] border border-white/5 focus:border-[#BF532B]/50 rounded-xl px-4 py-4 text-white font-manrope font-medium placeholder:text-white/20 focus:outline-none transition-all resize-none h-[120px] ${
                  !isEditing ? "cursor-not-allowed opacity-70" : ""
                }`}
                placeholder="Tell us a little about yourself..."
              />
              <p className="text-white/30 text-xs text-right">
                {formData.bio.length}/500
              </p>
            </div>
          </div>
        </section>

        {/* Location & Professional Section */}
        <section className="pb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-[30px] h-[30px] rounded-[8px] bg-[#BF532B] text-white flex items-center justify-center shadow-[0_4px_10px_-2px_rgba(191,83,43,0.3)]">
              <MapPin size={16} strokeWidth={2.5} />
            </div>
            <h2 className="text-[17px] font-manrope font-bold text-white tracking-wide">
              Location & Professional
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7 w-full">
            {/* City */}
            <div className="space-y-2">
              <label className="text-[13px] text-white/40 font-manrope font-medium pl-1 flex items-center gap-2">
                <MapPin size={14} />
                City
              </label>
              <input
                name="city"
                disabled={!isEditing}
                value={formData.city}
                onChange={handleInputChange}
                maxLength={60}
                className={`w-full bg-[#0A0A0A] border border-white/5 focus:border-[#BF532B]/50 rounded-xl px-4 py-3.5 text-white font-manrope font-medium placeholder:text-white/20 focus:outline-none transition-all ${
                  !isEditing ? "cursor-not-allowed opacity-70" : ""
                }`}
                placeholder="Enter city"
              />
            </div>

            {/* State */}
            <div className="space-y-2">
              <label className="text-[13px] text-white/40 font-manrope font-medium pl-1 flex items-center gap-2">
                <MapPin size={14} />
                State
              </label>
              <input
                name="state"
                disabled={!isEditing}
                value={formData.state}
                onChange={handleInputChange}
                maxLength={60}
                className={`w-full bg-[#0A0A0A] border border-white/5 focus:border-[#BF532B]/50 rounded-xl px-4 py-3.5 text-white font-manrope font-medium placeholder:text-white/20 focus:outline-none transition-all ${
                  !isEditing ? "cursor-not-allowed opacity-70" : ""
                }`}
                placeholder="Enter state"
              />
            </div>

            {/* Country */}
            <div className="space-y-2 col-span-1 sm:col-span-2">
              <label className="text-[13px] text-white/40 font-manrope font-medium pl-1 flex items-center gap-2">
                <MapPin size={14} />
                Country
              </label>
              <input
                name="country"
                disabled={!isEditing}
                value={formData.country}
                onChange={handleInputChange}
                maxLength={60}
                className={`w-full bg-[#0A0A0A] border border-white/5 focus:border-[#BF532B]/50 rounded-xl px-4 py-3.5 text-white font-manrope font-medium placeholder:text-white/20 focus:outline-none transition-all ${
                  !isEditing ? "cursor-not-allowed opacity-70" : ""
                }`}
                placeholder="Enter country"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
