// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn get_technical_analysis_score() -> String {
    let response = reqwest::blocking::Client::new().post("https://scanner.tradingview.com/crypto/scan").body("{\n  \"symbols\": {\n    \"tickers\": [\n      \"BINANCE:BNBUSDT\"\n    ]\n  },\n  \"columns\": [\n    \"Recommend.All|1\"\n  ]\n}").send();

    response.unwrap().text().unwrap()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_technical_analysis_score])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

