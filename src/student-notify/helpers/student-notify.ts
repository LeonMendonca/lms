import { NotificationType } from '../entities/student-notify.entity';

//   BOOK_RETURNED = 'book_returned',
//   BOOK_REISSUE_REQUESTED = 'book_reissue_requested',
//   BOOK_REISSUE_APPROVED = 'book_reissue_approved',

//   // Library entry/exit
//   LIBRARY_ENTRY = 'library_entry',
//   LIBRARY_EXIT = 'library_exit',

//   // Notes related
//   NOTES_REQUESTED = 'notes_requested',
//   NOTES_APPROVED = 'notes_approved',
//   NOTES_REJECTED = 'notes_rejected',

//   // Fees/Penalties
//   PENALTY_PAID = 'penalty_paid',
//   PENALTY_OVERDUE = 'penalty_overdue',

//   // Activity reporting
//   ACTIVITY_REPORTED = 'activity_reported',
//   ACTIVITY_RESOLVED = 'activity_resolved',

export const generateNotificationContent = (
  type: NotificationType,
  data: Record<string, any>,
): { title: string; message: string } => {
  switch (type) {
    case NotificationType.BOOK_REQUESTED:
      return {
        title: 'Book Request Submitted',
        message: `Your request for book "${data.bookTitle}" has been submitted`,
      };

    case NotificationType.BOOK_REQUEST_APPROVED:
      return {
        title: 'Book Request Approved',
        message: `Your request for book "${data.bookTitle}" has been approved`,
      };

    case NotificationType.BOOK_REQUEST_REJECTED:
      return {
        title: 'Book Request Rejected',
        message: `Your request for book "${data.bookTitle}" has been rejected`,
      };

    case NotificationType.BOOK_BORROWED:
      return {
        title: 'Book Borrowed Successfully',
        message: `You have borrowed "${data.bookTitle}"`,
      };

    case NotificationType.BOOK_RETURNED:
      return {
        title: 'Book Returned Successfully',
        message: `You have returned "${data.bookTitle}".`,
      };

    case NotificationType.BOOK_REISSUE_REQUESTED:
      return {
        title: 'Book Reissue Requested',
        message: `You have requested "${data.bookTitle}" for a reissue.`,
      };

    case NotificationType.BOOK_REISSUE_APPROVED:
      return {
        title: 'Book Reissue Approved',
        message: `Your reissue for "${data.bookTitle}" is approved.`,
      };

    case NotificationType.BOOK_REISSUE_REJECTED:
      return {
        title: 'Book Reissue Rejected',
        message: `Your reissue for "${data.bookTitle}" is rejected.`,
      };

























































    case NotificationType.LIBRARY_ENTRY:
      return {
        title: 'Library Entry Recorded',
        message: `You have entered the library. Please make sure to follow the library rules.`,
      };

    case NotificationType.LIBRARY_EXIT:
      return {
        title: 'Library Exit Recorded',
        message: `You have exited the library. We hope you had a productive time.`,
      };









    case NotificationType.NOTES_REQUESTED:
      return {
        title: 'Notes Requested',
        message: `You have requested notes for the course: "${data.courseName}". Your request is being processed.`,
      };

    case NotificationType.NOTES_APPROVED:
      return {
        title: 'Notes Approved',
        message: `Your request for notes from the course "${data.courseName}" has been approved.`,
      };

    case NotificationType.NOTES_REJECTED:
      return {
        title: 'Notes Request Rejected',
        message: `Your request for notes from the course "${data.courseName}" has been rejected.`,
      };

    case NotificationType.ACTIVITY_REPORTED:
      return {
        title: 'Activity Reported',
        message: `An activity has been reported related to you: "${data.activityDescription}". Please take necessary actions.`,
      };

    case NotificationType.ACTIVITY_RESOLVED:
      return {
        title: 'Activity Resolved',
        message: `The reported activity: "${data.activityDescription}" has been resolved.`,
      };

    case NotificationType.PENALTY_ADDED:
      return {
        title: 'New Penalty Added',
        message: `A penalty of ₹${data.amount} has been added for the reason: ${data.reason}. Please pay it before the due date to avoid further actions.`,
      };

    case NotificationType.PENALTY_PAID:
      return {
        title: 'Penalty Paid',
        message: `Your penalty of ₹${data.amount} has been successfully paid. Thank you!`,
      };

    case NotificationType.PENALTY_OVERDUE:
      return {
        title: 'Penalty Overdue',
        message: `Your penalty of ₹${data.amount} is overdue. Please make the payment immediately to avoid any further consequences.`,
      };

    case NotificationType.PENALTY_ADDED:
      return {
        title: 'New Penalty Added',
        message: `A penalty of ₹${data.amount} has been added for ${data.reason}`,
      };

    // Add more cases for other notification types

    default:
      return {
        title: 'Notification',
        message: 'You have a new notification',
      };
  }
};
