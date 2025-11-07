'use client'

import { useState } from 'react'
import { Star, MessageSquare, User, ChevronRight, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image' // Using next/image for optimized images

interface Review {
  id: string
  reviewerName: string
  rating: number
  comment: string
  date: string
  avatarUrl?: string
}

interface ReviewsAndRatingsProps {
  reviews?: Review[]
  averageRating?: number
  totalReviews?: number
  isLoading?: boolean // Added for loading state
  error?: string // Added for error state
}

const DEFAULT_REVIEWS: Review[] = [
  {
    id: '1',
    reviewerName: 'Alice Johnson',
    rating: 5,
    comment: 'Fantastic charging experience! The host was very friendly and the station worked perfectly. Highly recommend!',
    date: '2023-10-26',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Alice%20J'
  },
  {
    id: '2',
    reviewerName: 'Bob Williams',
    rating: 4,
    comment: 'Good reliable charger. A bit far from my usual route but worth it for the price. Easy to book.',
    date: '2023-10-25',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Bob%20W'
  },
  {
    id: '3',
    reviewerName: 'Charlie Brown',
    rating: 5,
    comment: 'Seamless process from start to finish. My EV charged quickly, and the location was convenient. Will use again!',
    date: '2023-10-24',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Charlie%20B'
  },
  {
    id: '4',
    reviewerName: 'Diana Prince',
    rating: 3,
    comment: 'The charger was okay, but it took a bit longer than expected. Host was responsive though.',
    date: '2023-10-23',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Diana%20P'
  },
  {
    id: '5',
    reviewerName: 'Eve Adams',
    rating: 5,
    comment: 'Excellent service and a powerful charger. My go-to spot now for quick top-ups. Five stars!',
    date: '2023-10-22',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Eve%20A'
  }
]

const ITEMS_PER_PAGE = 3

export function ReviewsAndRatings({
  reviews = DEFAULT_REVIEWS,
  averageRating = 4.4,
  totalReviews = DEFAULT_REVIEWS.length,
  isLoading = false,
  error = ''
}: ReviewsAndRatingsProps = {}) {
  const [currentPage, setCurrentPage] = useState(0)

  const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE)
  const startIndex = currentPage * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentReviews = reviews.slice(startIndex, endIndex)

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
  }

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0))
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  // Design System Colors and Typography (Tailwind classes)
  const primaryColor = 'text-[#3B82F6]'
  const accentColor = 'text-[#3B82F6]' // Assuming accent is primary for stars
  const fillColor = 'fill-[#3B82F6]'
  const backgroundColor = 'bg-[#FFFFFF] dark:bg-surface'
  const surfaceColor = 'bg-background dark:bg-surface'
  const borderColor = 'border-[#E5E7EB] dark:border-border'
  const foregroundColor = 'text-muted-foreground dark:text-foreground'
  const mutedForegroundColor = 'text-muted-foreground dark:text-muted-foreground'
  const secondaryBgColor = 'bg-surface dark:bg-surface'
  const primaryForeground = 'text-muted-foreground dark:text-foreground' // Assuming primary foreground is text on secondary bg

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }} // Spacing 24
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={`w-full max-w-4xl mx-auto p-16 sm:p-24 lg:p-32 ${backgroundColor} font-inter`} // Spacing 16, 24, 32
    >
      <motion.div
        className={`${surfaceColor} ${borderColor} border rounded-xl p-24 shadow-md mb-24`} // Spacing 24
        initial={{ opacity: 0, y: 24 }} // Spacing 24
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <h2 className={`text-2xl font-semibold mb-16 flex items-center gap-8 ${foregroundColor}`}> {/* Spacing 16, 8 */}
          <MessageSquare className={`h-24 w-24 ${primaryColor}`} /> {/* Spacing 24 */}
          Customer Reviews
        </h2>
        <div className="flex items-center gap-16 mb-16"> {/* Spacing 16 */}
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-24 w-24 ${ // Spacing 24
                  i < Math.floor(averageRating) ? `${accentColor} ${fillColor}` : `${mutedForegroundColor}`
                }`}
              />
            ))}
          </div>
          <span className={`text-lg font-medium ${foregroundColor}`}>
            {averageRating.toFixed(1)} out of 5
          </span>
          <span className={`${mutedForegroundColor}`}>({totalReviews} reviews)</span>
        </div>
      </motion.div>

      {error && (
        <div className="rounded-lg bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive p-16 mb-24"> {/* Spacing 16, 24 */}
          <p className="text-sm text-destructive dark:text-destructive">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-16 animate-pulse"> {/* Spacing 16 */}
          {[...Array(ITEMS_PER_PAGE)].map((_, index) => (
            <div key={index} className={`${surfaceColor} ${borderColor} border rounded-lg p-16 shadow-sm`}> {/* Spacing 16 */}
              <div className="flex items-center mb-16"> {/* Spacing 16 */}
                <div className="w-40 h-40 rounded-full mr-16 bg-surface dark:bg-surface"></div> {/* Spacing 40, 16 */}
                <div>
                  <div className="h-16 bg-surface dark:bg-surface rounded w-32 mb-8"></div> {/* Spacing 16, 32, 8 */}
                  <div className="h-16 bg-surface dark:bg-surface rounded w-24"></div> {/* Spacing 16, 24 */}
                </div>
              </div>
              <div className="h-16 bg-surface dark:bg-surface rounded w-full mb-8"></div> {/* Spacing 16, 8 */}
              <div className="h-16 bg-surface dark:bg-surface rounded w-5/6"></div> {/* Spacing 16 */}
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          className="space-y-16" // Spacing 16
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence mode="wait">
            {currentReviews.length > 0 ? (
              currentReviews.map((review) => (
                <motion.div
                  key={review.id}
                  variants={itemVariants}
                  exit={{ opacity: 0, y: -24 }} // Spacing 24
                  className={`${surfaceColor} ${borderColor} border rounded-lg p-16 shadow-sm
                    hover:-translate-y-8 hover:shadow-lg transition-all duration-300 ease-in-out`} // Spacing 16, 8
                >
                  <div className="flex items-center mb-16"> {/* Spacing 16 */}
                    {review.avatarUrl ? (
                      <Image
                        src={review.avatarUrl}
                        alt={review.reviewerName}
                        width={40} // Spacing 40
                        height={40} // Spacing 40
                        className="w-40 h-40 rounded-full mr-16 bg-surface dark:bg-surface object-cover" // Spacing 40, 16
                      />
                    ) : (
                      <div className="w-40 h-40 rounded-full mr-16 bg-surface dark:bg-surface flex items-center justify-center"> {/* Spacing 40, 16 */}
                        <User className={`h-24 w-24 ${mutedForegroundColor}`} /> {/* Spacing 24 */}
                      </div>
                    )}
                    <div>
                      <p className={`font-medium ${foregroundColor}`}>{review.reviewerName}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-16 w-16 ${ // Spacing 16
                              i < review.rating ? `${accentColor} ${fillColor}` : `${mutedForegroundColor}`
                            }`}
                          />
                        ))}
                        <span className={`ml-8 text-sm ${mutedForegroundColor}`}>{review.date}</span> {/* Spacing 8 */}
                      </div>
                    </div>
                  </div>
                  <p className={`${mutedForegroundColor} leading-relaxed`}>{review.comment}</p>
                </motion.div>
              ))
            ) : (
              <motion.div
                key="no-reviews"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`${surfaceColor} ${borderColor} border rounded-lg p-24 text-center ${mutedForegroundColor}`} // Spacing 24
              >
                <MessageSquare className={`h-48 w-48 mx-auto mb-16 ${mutedForegroundColor}`} /> {/* Spacing 48, 16 */}
                <p className="text-lg font-medium">No reviews yet.</p>
                <p>Be the first to share your experience!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {reviews.length > ITEMS_PER_PAGE && (
        <div className="flex justify-between items-center mt-24"> {/* Spacing 24 */}
          <motion.button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-16 py-8 ${secondaryBgColor} ${primaryForeground} rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-8
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 transition-all duration-150 ease-in-out`} // Spacing 16, 8, 8
            aria-label="Previous reviews"
          >
            <ChevronLeft className="h-20 w-20" /> {/* Spacing 20 */}
            Prev
          </motion.button>
          <span className={`${mutedForegroundColor}`}>
            Page {currentPage + 1} of {totalPages}
          </span>
          <motion.button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`px-16 py-8 ${secondaryBgColor} ${primaryForeground} rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-8
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 transition-all duration-150 ease-in-out`} // Spacing 16, 8, 8
            aria-label="Next reviews"
          >
            Next
            <ChevronRight className="h-20 w-20" /> {/* Spacing 20 */}
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}

export default function ReviewsAndRatingsDemo() {
  return <ReviewsAndRatings />
}