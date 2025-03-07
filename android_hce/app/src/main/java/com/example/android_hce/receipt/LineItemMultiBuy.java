package com.example.android_hce.receipt;

import android.content.ContentValues;

import com.example.android_hce.db.ReceiptDatabaseContract;

public class LineItemMultiBuy implements LineItemComment{
    public final String expl;
    public final int disc;

    public LineItemMultiBuy(String e, int d) {
        this.expl = e;
        this.disc = d;
    }

    @Override
    public void fill(ContentValues vs) {
        vs.put(ReceiptDatabaseContract.ReceiptLineCommentEntry.COLUMN_VALUE_EXPL, expl);
        vs.put(ReceiptDatabaseContract.ReceiptLineCommentEntry.COLUMN_VALUE_DISC, disc);
    }
}
