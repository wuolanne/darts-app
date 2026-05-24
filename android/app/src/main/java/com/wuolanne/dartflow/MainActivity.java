package com.wuolanne.dartflow;

import android.graphics.Color;
import android.os.Bundle;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        final int systemBarDark = Color.parseColor("#10141B");

        // Keep app content below system bars and force dark bars with light icons.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        getWindow().setStatusBarColor(systemBarDark);
        getWindow().setNavigationBarColor(systemBarDark);

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
            getWindow().setNavigationBarDividerColor(systemBarDark);
        }

        WindowInsetsControllerCompat insetsController =
            new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
        insetsController.setAppearanceLightStatusBars(false);
        insetsController.setAppearanceLightNavigationBars(false);
    }
}
