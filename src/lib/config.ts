export const config = {
    sms: {
        notifyLk: {
            userId: process.env.NOTIFY_LK_USER_ID || '',
            apiKey: process.env.NOTIFY_LK_API_KEY || '',
            senderId: process.env.NOTIFY_LK_SENDER_ID || 'Sahana',
            baseUrl: 'https://app.notify.lk/api/v1/send',
        },
    },
    cron: {
        interestCalculation: '0 0 * * *', // Every day at midnight
        overdueNotification: '0 9 * * *', // Every day at 9 AM
    },
}; 