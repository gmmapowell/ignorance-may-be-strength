package com.example.android_hce;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.example.android_hce.apdu.APDUCommand;
import com.example.android_hce.apdu.APDUResponse;
import com.example.android_hce.receipt.DbContent;
import com.example.android_hce.receipt.Footer;
import com.example.android_hce.receipt.Header;
import com.example.android_hce.receipt.LineItem;
import com.example.android_hce.receipt.LineItemComment;
import com.example.android_hce.receipt.LineItemMultiBuy;
import com.example.android_hce.receipt.LineItemQuant;
import com.example.android_hce.receipt.Payment;
import com.example.android_hce.receipt.Preface;
import com.example.android_hce.db.ReceiptDatabaseContract;
import com.example.android_hce.db.ReceiptDatabaseHelper;
import com.example.android_hce.receipt.Total;
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
            extractMerchantAndTotal(row);

            long newRowId = db.insert(ReceiptDatabaseContract.ReceiptEntry.TABLE_NAME, null, row);
            if (newRowId == -1) {
                Log.e("receipt", "could not insert the data for some reason");
                return;
            }

            int forReceipt = (int) newRowId;
            int itemRow = -1;
            for (WireBlock wb: blocks) {
                DbContent c = wb.read();
                row = new ContentValues();
                wb.fill(row);
                c.fill(row);
                long subRowId = -1;
                if (c instanceof LineItemComment) {
                    row.put(ReceiptDatabaseContract.ReceiptLineCommentEntry.COLUMN_NAME_ENTRY, itemRow);
                    long tmp = db.insert(ReceiptDatabaseContract.ReceiptLineCommentEntry.TABLE_NAME, null, row);
                    if (tmp == -1) {
                        Log.e("receipt", "could not insert a comment row for some reason");
                    }
                } else {
                    row.put(ReceiptDatabaseContract.ReceiptLineEntry.COLUMN_NAME_RECEIPT, forReceipt);
                    subRowId = db.insert(ReceiptDatabaseContract.ReceiptLineEntry.TABLE_NAME, null, row);
                    if (subRowId == -1) {
                        Log.e("receipt", "could not insert a line row for some reason");
                    }
                    else
                        itemRow = (int)subRowId;
                }
            }

            // then issue a notification
            showNotification(newRowId);
        } catch (Throwable t) {
            Log.w("receipt", t);
            return;
        }
    }

    private void extractMerchantAndTotal(ContentValues row) {
        for (WireBlock wb : blocks) {
            if (wb.is(0x12)) {
                Preface p = WireBlock.readPreface(wb);
                if (p.title.equals("Name")) {
                    row.put(ReceiptDatabaseContract.ReceiptEntry.COLUMN_NAME_MERCHANT, p.value);
                }
            } else if (wb.is(0x3f)) {
                Total t = WireBlock.readTotal(wb);
                row.put(ReceiptDatabaseContract.ReceiptEntry.COLUMN_NAME_TOTAL, t.amount);
            }
        }
    }


    private void showNotification(long notificationId) {
        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        Intent intent = new Intent(context, ReceiptActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder notificationBuilder =
                new NotificationCompat.Builder(context, ReceiptApplication.CHANNEL_ID)
                        .setSmallIcon(R.drawable.credit_card)
                        .setContentTitle("NFC")
                        .setContentText("NFC Contact Made")
                        .setPriority(NotificationCompat.PRIORITY_HIGH)
                        .setCategory(NotificationCompat.CATEGORY_STATUS)
                        .setContentIntent(pendingIntent)
                        .setAutoCancel(true);

        notificationManager.notify((int)notificationId, notificationBuilder.build());
    }
}
