package com.example.android_hce.db;

import android.provider.BaseColumns;

public class ReceiptDatabaseContract {
    private ReceiptDatabaseContract() {
    }

    public static class ReceiptEntry implements BaseColumns {
        public final static String TABLE_NAME = "receipt";
        public final static String COLUMN_NAME_MERCHANT = "merchant";
        public final static String COLUMN_NAME_TOTAL = "total";
    }

    public static class ReceiptLineEntry implements BaseColumns {
        public final static String TABLE_NAME = "receipt_line";
        public final static String COLUMN_NAME_RECEIPT = "receipt_id";
        public final static String COLUMN_NAME_TYPE = "type";
        public final static String COLUMN_NAME_INDEX = "idx";
    }

    public static class ReceiptLineCommentEntry implements BaseColumns {
        public final static String TABLE_NAME = "receipt_line_comments";
        public final static String COLUMN_NAME_ENTRY = "entry_id";
        public final static String COLUMN_NAME_TYPE = "type";
        public final static String COLUMN_NAME_INDEX = "idx";
    }
}
