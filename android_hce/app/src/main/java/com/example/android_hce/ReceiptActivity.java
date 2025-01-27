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
            receiptText.append("Receipt " + rowId + " for " + merchant + " amount = " + total);
        }

        TextView tv = findViewById(R.id.receipt_text);
        tv.setText(receiptText.toString());
    }
}