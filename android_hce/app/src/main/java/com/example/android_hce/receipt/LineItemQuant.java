package com.example.android_hce.receipt;

import android.content.ContentValues;

import com.example.android_hce.db.ReceiptDatabaseContract;

public class LineItemQuant implements LineItemComment {
    public final int quant;
    public final int unit;

    public LineItemQuant(int q, int u) {
        this.quant = q;
        this.unit = u;
    }

    @Override
    public void fill(ContentValues vs) {
        vs.put(ReceiptDatabaseContract.ReceiptLineCommentEntry.COLUMN_VALUE_QUANT, quant);
        vs.put(ReceiptDatabaseContract.ReceiptLineCommentEntry.COLUMN_VALUE_UNIT, unit);
    }
}
