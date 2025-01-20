package com.example.android_hce;

import android.app.NotificationManager;
import android.content.ContentValues;
import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.example.android_hce.apdu.APDUCommand;
import com.example.android_hce.apdu.APDUResponse;
import com.example.android_hce.db.ReceiptDatabaseContract;
import com.example.android_hce.db.ReceiptDatabaseHelper;
import com.example.android_hce.receipt.WireBlock;

import java.util.ArrayList;
import java.util.List;

public class ReceiptSessionController implements SessionController {
    private final ReceiptDatabaseHelper dbHelper;
    Context context;
    List<WireBlock> blocks = new ArrayList<>();

    public ReceiptSessionController(Context context, ReceiptDatabaseHelper dbHelper) {
        this.context = context;
        this.dbHelper = dbHelper;
    }

    @Override
    public APDUResponse dispatch(APDUCommand cmd) {
        return cmd.dispatch(this);
    }

    @Override
    public void updateBinary(int p1, int p2, byte[] data) {
        blocks.add(new WireBlock(p1, p2, data));
    }

    @Override
    public void executeCommand() {
        try {
            Log.w("receipt", "in executeCommand");
            // take all the messages we collected and build a receipt in the db
            SQLiteDatabase db = dbHelper.getWritableDatabase();

            ContentValues row = new ContentValues();
            row.put(ReceiptDatabaseContract.ReceiptEntry.COLUMN_NAME_MERCHANT, "hello, world");
            row.put(ReceiptDatabaseContract.ReceiptEntry.COLUMN_NAME_TOTAL, 420);

            long newRowId = db.insert(ReceiptDatabaseContract.ReceiptEntry.TABLE_NAME, null, row);
            if (newRowId == -1) {
                Log.e("receipt", "could not insert the data for some reason");
                return;
            }
            // then issue a notification
            showNotification(newRowId);
        } catch (Throwable t) {
            Log.w("receipt", t);
            return;
        }
    }


    private void showNotification(long notificationId) {
        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(context, ReceiptApplication.CHANNEL_ID)
                        .setSmallIcon(R.drawable.credit_card)
                        .setContentTitle("NFC")
                        .setContentText("NFC Contact Made")
                        .setPriority(NotificationCompat.PRIORITY_HIGH)
                        .setCategory(NotificationCompat.CATEGORY_STATUS);

        notificationManager.notify((int)notificationId, notificationBuilder.build());
    }
}
