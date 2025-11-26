import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { reviewsAPI } from '@/lib/api';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
  existingReview?: {
    id: string;
    rating: number;
    text?: string;
  } | null;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewSubmitted, existingReview }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [text, setText] = useState(existingReview?.text || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a rating',
        variant: 'destructive',
      });
      return;
    }

    if (text.trim().length < 10) {
      toast({
        title: 'Review too short',
        description: 'Please write at least 10 characters',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (existingReview) {
        // Update existing review
        await reviewsAPI.update(existingReview.id, { rating, text: text.trim() });
        toast({
          title: 'Review updated',
          description: 'Your review has been updated successfully',
        });
      } else {
        // Create new review
        await reviewsAPI.create({
          productId,
          rating,
          text: text.trim(),
        });
        toast({
          title: 'Review submitted',
          description: 'Thank you for your review!',
        });
      }

      setRating(0);
      setText('');
      onReviewSubmitted();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="rating">Rating *</Label>
        <div className="flex items-center space-x-2 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <svg
                className={`h-6 w-6 ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3.167l1.753 3.555 3.919.569-2.836 2.764.669 3.906L10 12.19 6.495 13.96l.669-3.906-2.836-2.764 3.919-.569L10 3.167z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          ))}
          {rating > 0 && (
            <span className="text-sm text-gray-600 ml-2">{rating} out of 5</span>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="text">Your Review *</Label>
        <Textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts about this product..."
          className="mt-2"
          rows={5}
          minLength={10}
          maxLength={2000}
        />
        <p className="text-xs text-gray-500 mt-1">
          {text.length} / 2000 characters (minimum 10)
        </p>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || rating === 0 || text.trim().length < 10}
        className="w-full"
      >
        {isSubmitting
          ? 'Submitting...'
          : existingReview
          ? 'Update Review'
          : 'Submit Review'}
      </Button>
    </form>
  );
};

export default ReviewForm;

