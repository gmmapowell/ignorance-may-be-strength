package com.example.android_hce;

import android.app.NotificationManager;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.nfc.cardemulation.HostApduService;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;

import androidx.core.app.NotificationCompat;

public class ReceiveReceiptService extends HostApduService {
    public ReceiveReceiptService() {
    }

    @Override
    public byte[] processCommandApdu(byte[] apdu, Bundle extras) {
       StringBuilder sb = new StringBuilder("apdu = ");
       for (int i=0;i<apdu.length;i++) {
           int x = ((int)apdu[i])&0xff;
           String s = Integer.toHexString(x);
           if (s.length() < 2)
               sb.append("0");
           sb.append(s);
           sb.append(" ");
       }
       Log.w("service", sb.toString());
       showNotification();
       return new byte[] { (byte)0x90, 0x00 }; // APDU "OK"
    }

    @Override
    public void onDeactivated(int reason) {
        Log.w("service", "lost contact with card: " + reason);
    }

    private void showNotification() {
        int notificationId = 99; // is this more a constant or more a per request ID?

        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(this, ReceiptApplication.CHANNEL_ID)
                        .setSmallIcon(R.drawable.credit_card)
                        .setContentTitle("NFC")
                        .setContentText("NFC Contact Made")
                        .setPriority(NotificationCompat.PRIORITY_HIGH)
                        .setCategory(NotificationCompat.CATEGORY_STATUS);

        notificationManager.notify(notificationId, notificationBuilder.build());
    }
}
