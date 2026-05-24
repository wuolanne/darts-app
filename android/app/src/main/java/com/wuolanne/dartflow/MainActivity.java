package com.wuolanne.dartflow;

import android.graphics.drawable.ColorDrawable;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;

import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        applyDarkSystemBars();
    }

    @Override
    protected void onResume() {
        super.onResume();
        applyDarkSystemBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            applyDarkSystemBars();
        }
    }

    private void applyDarkSystemBars() {
        final int systemBarDark = Color.parseColor("#10141B");

        // Keep app content below system bars and force dark bars with light icons.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        getWindow().setBackgroundDrawable(new ColorDrawable(systemBarDark));
        getWindow().getDecorView().setBackgroundColor(systemBarDark);
        getWindow().setStatusBarColor(systemBarDark);
        getWindow().setNavigationBarColor(systemBarDark);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            getWindow().setNavigationBarDividerColor(systemBarDark);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            getWindow().setStatusBarContrastEnforced(false);
            getWindow().setNavigationBarContrastEnforced(false);
        }

        View decorView = getWindow().getDecorView();
        int uiFlags = decorView.getSystemUiVisibility()
            & ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
            & ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        decorView.setSystemUiVisibility(uiFlags);

        WindowInsetsControllerCompat insetsController =
            new WindowInsetsControllerCompat(getWindow(), decorView);
        insetsController.setAppearanceLightStatusBars(false);
        insetsController.setAppearanceLightNavigationBars(false);
    }
}
