package com.example.android_hce;

import android.app.NotificationManager;
import android.content.Context;

import androidx.core.app.NotificationCompat;

import com.example.android_hce.apdu.APDUCommand;
import com.example.android_hce.apdu.APDUResponse;

public class ReceiptSessionController implements SessionController {
    Context context;
    public ReceiptSessionController(Context context) {
        this.context = context;
    }

    @Override
    public APDUResponse dispatch(APDUCommand cmd) {
        return cmd.dispatch(this);
    }

    @Override
    public void updateBinary(int p1, int p2, byte[] data) {
        // This needs to collect all these messages for later processing

    }

    @Override
    public void executeCommand() {
        // take all the messages we collected and build a receipt in the db

        // then issue a notification
        showNotification();
    }


    private void showNotification() {
        int notificationId = 99; // is this more a constant or more a per request ID?

        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(context, ReceiptApplication.CHANNEL_ID)
                        .setSmallIcon(R.drawable.credit_card)
                        .setContentTitle("NFC")
                        .setContentText("NFC Contact Made")
                        .setPriority(NotificationCompat.PRIORITY_HIGH)
                        .setCategory(NotificationCompat.CATEGORY_STATUS);

        notificationManager.notify(notificationId, notificationBuilder.build());
    }
}
