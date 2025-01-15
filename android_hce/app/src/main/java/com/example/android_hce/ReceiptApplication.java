package com.example.android_hce;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;

public class ReceiptApplication extends Application {
    public static String CHANNEL_ID = "gmmapowell.com:receipts/notifications";

    @Override
    public void onCreate() {
        super.onCreate();
        NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Notifications for Receipts",
                NotificationManager.IMPORTANCE_HIGH
        );

        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.createNotificationChannel(channel);
    }
}
