package com.example.android_hce;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.os.Bundle;

import com.example.android_hce.db.ReceiptDatabaseContract;
import com.example.android_hce.db.ReceiptDatabaseHelper;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;

import android.util.Log;
import android.widget.TextView;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

public class ReceiptActivity extends AppCompatActivity {
    private final ReceiptDatabaseHelper dbHelper;
    private long rowId;

    public ReceiptActivity() {
        dbHelper = new ReceiptDatabaseHelper(this);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Bundle extras = getIntent().getExtras();
        rowId = extras.getLong("row_id");
        Log.w("ReceiptActivity", "want to show receipt " + rowId);

        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_receipt);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.receipt), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }

    @Override
    protected void onResume() {
        super.onResume();

        SQLiteDatabase db = dbHelper.getReadableDatabase();
        StringBuilder receiptText = new StringBuilder();
        try (Cursor c = db.query(ReceiptDatabaseContract.ReceiptEntry.TABLE_NAME, ReceiptDatabaseContract.ReceiptEntry.ALL_COLUMNS, ReceiptDatabaseContract.ReceiptEntry._ID + " = ?", new String[] { Long.toString(rowId) }, null, null, null)) {
            if (!c.moveToFirst()) {
                Log.e("ReceiptActivity", "there is no row " + rowId);
                return;
            }
            Log.w("ReceiptActivity", "have receipt with row " + rowId);
            String merchant = c.getString(0);
            int total = c.getInt(1);
            receiptText.append(String.format("Receipt %d for %s, total = %s\n", rowId, merchant, pounds(total)));

            try (Cursor lines = db.query(ReceiptDatabaseContract.ReceiptLineEntry.TABLE_NAME, ReceiptDatabaseContract.ReceiptLineEntry.ALL_COLUMNS, ReceiptDatabaseContract.ReceiptLineEntry.COLUMN_NAME_RECEIPT + " = ?", new String[] { Long.toString(rowId) }, null, null, ReceiptDatabaseContract.ReceiptLineEntry.COLUMN_NAME_TYPE + ", " +ReceiptDatabaseContract.ReceiptLineEntry.COLUMN_NAME_INDEX)) {
                if (!lines.moveToFirst()) {
                    Log.e("ReceiptActivity", "there is no row " + rowId);
                    return;
                }
                while (true) {
                    long lineId = lines.getLong(0);
                    int ty = lines.getInt(1);
                    switch (ty) {
                        case 0x11:
                            receiptText.append(lines.getString(6) + "\n"); // text_
                            break;
                        case 0x12: {
                            String title = lines.getString(7);
                            String value = lines.getString(8);
                            receiptText.append(String.format("%-12s %s\n", title + ":", value));
                            break;
                        }
                        case 0x21: {
                            String desc = lines.getString(4);
                            int price = lines.getInt(5);
                            receiptText.append(String.format("%-20s %s\n", desc + ":", pounds(price)));
                            break;
                        }
                        case 0x31:
                        case 0x32:
                        case 0x33:
                        case 0x3f: {
                            String text = lines.getString(6);
                            int amount = lines.getInt(3);
                            receiptText.append(String.format("%-20s %s\n", text + ":", pounds(amount)));
                            break;
                        }
                        case 0x41: {
                            String text = lines.getString(6);
                            int amount = lines.getInt(3);
                            receiptText.append(String.format("%-20s %s\n", "Paid by " + text + ":", pounds(amount)));
                            break;
                        }
                        case 0x51:
                            receiptText.append(lines.getString(6) + "\n"); // text_
                            break;
                        default:
                            Log.e("ReceiptActivity", "did not expect type " + ty);
                            break;
                    }

                    try (Cursor comments = db.query(ReceiptDatabaseContract.ReceiptLineCommentEntry.TABLE_NAME, ReceiptDatabaseContract.ReceiptLineCommentEntry.ALL_COLUMNS, ReceiptDatabaseContract.ReceiptLineCommentEntry.COLUMN_NAME_ENTRY + " = ?", new String[] { Long.toString(lineId) }, null, null, ReceiptDatabaseContract.ReceiptLineCommentEntry.COLUMN_NAME_INDEX)) {
                        if (comments.moveToFirst()) {
                            while (true) {
                                int cty = comments.getInt(0);
                                switch (cty) {
                                    case 0x22: {
                                        int quant = comments.getInt(4);
                                        int unit = comments.getInt(5);
                                        receiptText.append(String.format("   %d @ %s\n", quant, pounds(unit)));
                                        break;
                                    }
                                    case 0x23: {
                                        int disc = comments.getInt(2);
                                        String expl = comments.getString(3);
                                        receiptText.append(String.format("   %s: %s\n", expl, pounds(disc)));
                                        break;                                    }
                                    default:
                                        Log.e("ReceiptActivity", "did not expect comment type " + cty);
                                        break;
                                }
                                if (!comments.moveToNext())
                                    break;
                            }
                        }
                    }
                    if (!lines.moveToNext())
                        break;
                }
            }
        }

        TextView tv = findViewById(R.id.receipt_text);
        tv.setText(receiptText.toString());
    }

    public String pounds(int total) {
        String pounds = String.format("£%d", total/100);
        return String.format("%6s.%02d", pounds, total%100);
    }
}