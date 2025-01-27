package com.example.android_hce.db;

import android.provider.BaseColumns;

public class ReceiptDatabaseContract {
    private ReceiptDatabaseContract() {
    }

    public static class ReceiptEntry implements BaseColumns {
        public final static String TABLE_NAME = "receipt";
        public final static String COLUMN_NAME_MERCHANT = "merchant";
        public final static String COLUMN_NAME_TOTAL = "total";
        public static final String[] ALL_COLUMNS = new String[] {
            COLUMN_NAME_MERCHANT,
            COLUMN_NAME_TOTAL
        };
    }

    public static class ReceiptLineEntry implements BaseColumns {
        public final static String TABLE_NAME = "receipt_line";
        public final static String COLUMN_NAME_RECEIPT = "receipt_id";
        public final static String COLUMN_NAME_TYPE = "type";
        public final static String COLUMN_NAME_INDEX = "idx";
        public final static String COLUMN_VALUE_AMOUNT = "amount";
        public final static String COLUMN_VALUE_DESC = "desc_";
        public static final String COLUMN_VALUE_PRICE = "price";
        public final static String COLUMN_VALUE_TEXT = "text_";
        public static final String COLUMN_VALUE_TITLE = "title";
        public static final String COLUMN_VALUE_VALUE = "value";
    }

    public static class ReceiptLineCommentEntry implements BaseColumns {
        public final static String TABLE_NAME = "receipt_line_comments";
        public final static String COLUMN_NAME_ENTRY = "entry_id";
        public final static String COLUMN_NAME_TYPE = "type";
        public static final String COLUMN_VALUE_DISC = "disc";
        public static final String COLUMN_VALUE_EXPL = "expl";
        public final static String COLUMN_NAME_INDEX = "idx";
        public static final String COLUMN_VALUE_QUANT = "quant";
        public static final String COLUMN_VALUE_UNIT = "unit";
    }
}
