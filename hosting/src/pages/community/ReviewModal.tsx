import React, { useState } from "react";
import { X, Star, Upload, Trash2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/context/ToastContext";
import { createReview } from "@/services/reviewApi";
import { fileToDataUrl } from "@/utils/fileHelpers";
import { api } from "@/services/apiClient";

interface ReviewModalProps {
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ orderId, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileBase64 = await fileToDataUrl(file);
        const response = await api.post<{ url: string }>("/upload/image", {
          fileBase64,
          folder: `foodie/reviews/${orderId}`
        });
        return response.url;
      });

      const urls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...urls]);
      showToast("Images uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      showToast("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReview({
        orderId,
        rating,
        comment,
        images
      });
      showToast("Thank you for your review!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Review error:", error);
      showToast("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Rate your meal</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Overall Rating</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="group relative"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tell us about your experience</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like? How was the taste and delivery?"
              rows={4}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          {/* Photos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Food Photos (Optional)</label>
              <label className="cursor-pointer text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                <Camera className="h-4 w-4" />
                Add Photos
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              {images.map((url, i) => (
                <div key={i} className="relative h-20 w-20 group">
                  <img src={url} className="h-full w-full rounded-xl object-cover" alt={`Preview ${i}`} />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {isUploading && (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100 animate-pulse">
                  <Upload className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 rounded-2xl py-6" onClick={onClose}>
              Maybe later
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 rounded-2xl bg-orange-500 py-6 text-white hover:bg-orange-600"
            >
              {isSubmitting ? "Submitting..." : "Post Review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
