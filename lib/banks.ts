// lib/banks.ts
export function getBankCode(bankName: string): string {
    const bankCodes: Record<string, string> = {
      "Access Bank": "044",
      "Access Bank (Diamond)": "063",
      "Citibank Nigeria": "023",
      "Ecobank Nigeria": "050",
      "Fidelity Bank": "070",
      "First Bank of Nigeria": "011",
      "First City Monument Bank": "214",
      FCMB: "214",
      "Guaranty Trust Bank": "058",
      GTBank: "058",
      "Heritage Bank": "030",
      "Keystone Bank": "082",
      "Polaris Bank": "076",
      "Providus Bank": "101",
      "Stanbic IBTC Bank": "221",
      "Standard Chartered Bank": "068",
      "Sterling Bank": "232",
      "SunTrust Bank": "100",
      "Union Bank of Nigeria": "032",
      "United Bank For Africa": "033",
      UBA: "033",
      "Unity Bank": "215",
      "Wema Bank": "035",
      "Zenith Bank": "057",
      "Kuda Bank": "50211",
      "Rubies Bank": "125",
      "VFD Microfinance Bank": "566",
      Moniepoint: "50515",
      Opay: "999992",
      PalmPay: "999991",
      "Sparkle Microfinance Bank": "51310",
      "Rephidim Microfinance Bank": "50767",
      "NPF Microfinance Bank": "50629",
    };
  
    if (bankCodes[bankName]) return bankCodes[bankName];
  
    const normalizedName = bankName.toLowerCase().trim();
    for (const [key, value] of Object.entries(bankCodes)) {
      if (key.toLowerCase() === normalizedName) return value;
    }
  
    console.warn(`Bank code not found for: ${bankName}`);
    return "000";
  }
  