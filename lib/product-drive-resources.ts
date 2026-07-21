/** Google Drive file links for Hi-MO X10 product matrix (view-only). */

export interface DriveResourceLink {
  label: string;
  url: string;
  fileId: string;
  category?: string;
}

export interface ProductDriveResources {
  datasheet?: DriveResourceLink;
  warranty?: DriveResourceLink;
  installationManual?: DriveResourceLink;
  photos: DriveResourceLink[];
  certificates: DriveResourceLink[];
}

export const PRODUCT_DRIVE_RESOURCES: Record<string, ProductDriveResources> = 
{
  "LR7-54HVB": {
    "datasheet": {
      "label": "AU_Datasheet_X10_LR7-54HVB_475-495.pdf",
      "url": "https://drive.google.com/file/d/1I4d549GcbGgTDg-iWi_yRtqUESrY--Ck/view",
      "fileId": "1I4d549GcbGgTDg-iWi_yRtqUESrY--Ck"
    },
    "warranty": {
      "label": "AU Limited Warranty for LONGi Hi-MOX10 Solar Modules (Distributed Generation Market).pdf",
      "url": "https://drive.google.com/file/d/1fv3othslPukZVzGniHH5RIrqA0BRoULt/view",
      "fileId": "1fv3othslPukZVzGniHH5RIrqA0BRoULt"
    },
    "installationManual": {
      "label": "AU Installation Manual for LONGi Solar PV Modules（DGBG Only）V3.1 202511 (2).pdf",
      "url": "https://drive.google.com/file/d/1IolnDUn2KgP7j8MziiGvzM0jEb2CfEKc/view",
      "fileId": "1IolnDUn2KgP7j8MziiGvzM0jEb2CfEKc"
    },
    "photos": [
      {
        "label": "Bevel view",
        "url": "https://drive.google.com/file/d/1akeaCWZXZcS39wMJ3LsBae21heoUmTPg/view",
        "fileId": "1akeaCWZXZcS39wMJ3LsBae21heoUmTPg"
      },
      {
        "label": "Front view",
        "url": "https://drive.google.com/file/d/1gR1nssSuBDjVTboL-B5GcZIPZawRXS3D/view",
        "fileId": "1gR1nssSuBDjVTboL-B5GcZIPZawRXS3D"
      },
      {
        "label": "Rear view",
        "url": "https://drive.google.com/file/d/1WXK7WjT7yb6dYIKY6HbrBn_fDfS5AOMb/view",
        "fileId": "1WXK7WjT7yb6dYIKY6HbrBn_fDfS5AOMb"
      },
      {
        "label": "Side view",
        "url": "https://drive.google.com/file/d/1MrI_Y708uYTsbh6FAmhHCVNRAHDBBx6A/view",
        "fileId": "1MrI_Y708uYTsbh6FAmhHCVNRAHDBBx6A"
      }
    ],
    "certificates": [
      {
        "label": "Ammonia · Ammonia_IEC62716_Single_Cert.pdf",
        "category": "Ammonia",
        "url": "https://drive.google.com/file/d/1Nbp7FGzf6QEmuV73m3QQAfex6jAnFfj-/view",
        "fileId": "1Nbp7FGzf6QEmuV73m3QQAfex6jAnFfj-"
      },
      {
        "label": "DML · DML_TUV_Single_Cert.pdf",
        "category": "DML",
        "url": "https://drive.google.com/file/d/1oGsv_o_eBRo0zlL4cwDwghqOI8Py3Vd3/view",
        "fileId": "1oGsv_o_eBRo0zlL4cwDwghqOI8Py3Vd3"
      },
      {
        "label": "Dust & Sand · DustSand_TUV_Single_Cert.pdf",
        "category": "Dust & Sand",
        "url": "https://drive.google.com/file/d/1k_Zr67_WlczlnHcmr_cGIlM2QwrcwA0H/view",
        "fileId": "1k_Zr67_WlczlnHcmr_cGIlM2QwrcwA0H"
      },
      {
        "label": "Hail · Hail_35+45mm_IEC61215_LR7-54HVB+54HVD+72HVDF_Cert.pdf",
        "category": "Hail",
        "url": "https://drive.google.com/file/d/1X-cX7VaxcnKFk--z3sT6jhv8fb6Ughpg/view",
        "fileId": "1X-cX7VaxcnKFk--z3sT6jhv8fb6Ughpg"
      },
      {
        "label": "IEC 61215/61730 · IEC_61215+61730_2023_Single_Cert.pdf",
        "category": "IEC 61215/61730",
        "url": "https://drive.google.com/file/d/15i9lUrwldmAgthswHIbFRvZWiZdrh_JD/view",
        "fileId": "15i9lUrwldmAgthswHIbFRvZWiZdrh_JD"
      },
      {
        "label": "Salt Mist · SaltMist_IEC61701_L1+L6_Single_Cert.pdf",
        "category": "Salt Mist",
        "url": "https://drive.google.com/file/d/1ka7dzjRBRGOno5UWYBFbQMUTg0MNDozu/view",
        "fileId": "1ka7dzjRBRGOno5UWYBFbQMUTg0MNDozu"
      }
    ]
  },
  "LR7-54HVH": {
    "datasheet": {
      "label": "AU_Datasheet_X10_LR7-54HVH_475-500.pdf",
      "url": "https://drive.google.com/file/d/1KrsbrwAkqNlCRha5FHW-b_NaQyJDWU4g/view",
      "fileId": "1KrsbrwAkqNlCRha5FHW-b_NaQyJDWU4g"
    },
    "warranty": {
      "label": "AU Limited Warranty for LONGi Hi-MOX10 Solar Modules (Distributed Generation Market).pdf",
      "url": "https://drive.google.com/file/d/15_QeiP7eu4at--rixJg52Dbf0PErfhMR/view",
      "fileId": "15_QeiP7eu4at--rixJg52Dbf0PErfhMR"
    },
    "installationManual": {
      "label": "AU Installation Manual for LONGi Solar PV Modules（DGBG Only）V3.1 202511 (2).pdf",
      "url": "https://drive.google.com/file/d/1HZbliFRSN8wBrvB5Nv5v0j4IoINSj3qP/view",
      "fileId": "1HZbliFRSN8wBrvB5Nv5v0j4IoINSj3qP"
    },
    "photos": [
      {
        "label": "Bevel view",
        "url": "https://drive.google.com/file/d/1qiicWaUhqZKEeNP9AHZMfC9EMfprhz3o/view",
        "fileId": "1qiicWaUhqZKEeNP9AHZMfC9EMfprhz3o"
      },
      {
        "label": "Front view",
        "url": "https://drive.google.com/file/d/131nuTwMy4aUlNIBGySFaol19agt6EGAb/view",
        "fileId": "131nuTwMy4aUlNIBGySFaol19agt6EGAb"
      },
      {
        "label": "Rear view",
        "url": "https://drive.google.com/file/d/1tf0wPFPdUTHwSPeXwtuYkwdBZR7zkmDq/view",
        "fileId": "1tf0wPFPdUTHwSPeXwtuYkwdBZR7zkmDq"
      },
      {
        "label": "Side view",
        "url": "https://drive.google.com/file/d/1MEMDUnPTJMOfcwW4n_fuFskCE4hd4aje/view",
        "fileId": "1MEMDUnPTJMOfcwW4n_fuFskCE4hd4aje"
      }
    ],
    "certificates": [
      {
        "label": "Ammonia · Ammonia_IEC62716_Single_Cert.pdf",
        "category": "Ammonia",
        "url": "https://drive.google.com/file/d/158idNiARD9vBaZy_-mcDTbv8nziAuarO/view",
        "fileId": "158idNiARD9vBaZy_-mcDTbv8nziAuarO"
      },
      {
        "label": "DML · DML_TUV_Single_Cert.pdf",
        "category": "DML",
        "url": "https://drive.google.com/file/d/1FWMt1waEe4_Eydxq3I_nknVX2bqOGb1n/view",
        "fileId": "1FWMt1waEe4_Eydxq3I_nknVX2bqOGb1n"
      },
      {
        "label": "Dust & Sand · DustSand_TUV_Single_Cert.pdf",
        "category": "Dust & Sand",
        "url": "https://drive.google.com/file/d/1Fe9Jfvexor1MHYqnHMzG6YIlw9WgPKbs/view",
        "fileId": "1Fe9Jfvexor1MHYqnHMzG6YIlw9WgPKbs"
      },
      {
        "label": "Hail · Hail_35+45mm_IEC61215_LR7-54HVH_Cert.pdf",
        "category": "Hail",
        "url": "https://drive.google.com/file/d/1mmGdWt4XiJ-FIdn--sm7XUYlV-Nld57r/view",
        "fileId": "1mmGdWt4XiJ-FIdn--sm7XUYlV-Nld57r"
      },
      {
        "label": "IEC 61215/61730 · IEC_61215+61730_2023_Single_Cert.pdf",
        "category": "IEC 61215/61730",
        "url": "https://drive.google.com/file/d/157MiHCeszZprHPZeNNQgxm6nVaDTp6K9/view",
        "fileId": "157MiHCeszZprHPZeNNQgxm6nVaDTp6K9"
      },
      {
        "label": "Salt Mist · SaltMist_IEC61701_L1+L6_Single_Cert.pdf",
        "category": "Salt Mist",
        "url": "https://drive.google.com/file/d/1Qe733qOlNWkVCT5GtSmX1wqQ-LlggSj7/view",
        "fileId": "1Qe733qOlNWkVCT5GtSmX1wqQ-LlggSj7"
      },
      {
        "label": "Wind · Wind_Albright_LR7-54HVH_Report.pdf",
        "category": "Wind",
        "url": "https://drive.google.com/file/d/1swtU-j0ne4XBq384icbfPmT0mhW3apKe/view",
        "fileId": "1swtU-j0ne4XBq384icbfPmT0mhW3apKe"
      }
    ]
  },
  "LR7-54HVHF": {
    "datasheet": {
      "label": "AU_Datasheet_X10_LR7-54HVHF_480-500.pdf",
      "url": "https://drive.google.com/file/d/1rbq6u0F-ZvSznczst7WWK6OdPda6olH2/view",
      "fileId": "1rbq6u0F-ZvSznczst7WWK6OdPda6olH2"
    },
    "warranty": {
      "label": "AU Limited Warranty for LONGi Hi-MOX10 Solar Modules (Distributed Generation Market).pdf",
      "url": "https://drive.google.com/file/d/1woLR4OuXTw2lmb-d2JtYCVrGzhTyZ6UJ/view",
      "fileId": "1woLR4OuXTw2lmb-d2JtYCVrGzhTyZ6UJ"
    },
    "installationManual": {
      "label": "AU Installation Manual for LONGi Solar PV Modules（DGBG Only）V3.1 202511 (2).pdf",
      "url": "https://drive.google.com/file/d/1yS6DE4-UuhuOqlW8mHW2apmqqOuEB0h-/view",
      "fileId": "1yS6DE4-UuhuOqlW8mHW2apmqqOuEB0h-"
    },
    "photos": [],
    "certificates": [
      {
        "label": "Ammonia · Ammonia_IEC62716_Single_Cert.pdf",
        "category": "Ammonia",
        "url": "https://drive.google.com/file/d/1VAB_eLtVeOoFoXXvyVHJy5XLgu4t0RLd/view",
        "fileId": "1VAB_eLtVeOoFoXXvyVHJy5XLgu4t0RLd"
      },
      {
        "label": "DML · DML_TUV_Single_Cert.pdf",
        "category": "DML",
        "url": "https://drive.google.com/file/d/1Bds_C4gFM-n3si4uGIYxAkd5GLhIHrBa/view",
        "fileId": "1Bds_C4gFM-n3si4uGIYxAkd5GLhIHrBa"
      },
      {
        "label": "Dust & Sand · DustSand_TUV_Single_Cert.pdf",
        "category": "Dust & Sand",
        "url": "https://drive.google.com/file/d/1osqRgBeUdHhW5Bhd7_I1Ti8YNE5cSNoD/view",
        "fileId": "1osqRgBeUdHhW5Bhd7_I1Ti8YNE5cSNoD"
      },
      {
        "label": "IEC 61215/61730 · IEC_61215+61730_2023_Single_Cert.pdf",
        "category": "IEC 61215/61730",
        "url": "https://drive.google.com/file/d/1mC1D40ObWp_nTAZ_e-5_Cz0b7ELrsqm2/view",
        "fileId": "1mC1D40ObWp_nTAZ_e-5_Cz0b7ELrsqm2"
      },
      {
        "label": "Salt Mist · SaltMist_IEC61701_L1+L6_Single_Cert.pdf",
        "category": "Salt Mist",
        "url": "https://drive.google.com/file/d/1WdQK9YfXpFK4oHL5LVCGueCILNbQD3rn/view",
        "fileId": "1WdQK9YfXpFK4oHL5LVCGueCILNbQD3rn"
      }
    ]
  },
  "LR7-54HVDT": {
    "datasheet": {
      "label": "AU_Datasheet_X10_LR7-54HVDT_465-495.pdf",
      "url": "https://drive.google.com/file/d/1n-yzflthllcHQOM1Odvgl16x_EwroZE4/view",
      "fileId": "1n-yzflthllcHQOM1Odvgl16x_EwroZE4"
    },
    "warranty": {
      "label": "AU Limited Warranty for LONGi Hi-MOX10 Solar Modules (Distributed Generation Market).pdf",
      "url": "https://drive.google.com/file/d/1xNBMnKsV2gsACQZGJkvzlXSulCv1tbqE/view",
      "fileId": "1xNBMnKsV2gsACQZGJkvzlXSulCv1tbqE"
    },
    "installationManual": {
      "label": "AU Installation Manual for LONGi Solar PV Modules（DGBG Only）V3.1 202511 (2).pdf",
      "url": "https://drive.google.com/file/d/1bLl6qH_CDlMEVleW0D61KvOLNcRbKf4j/view",
      "fileId": "1bLl6qH_CDlMEVleW0D61KvOLNcRbKf4j"
    },
    "photos": [],
    "certificates": [
      {
        "label": "Ammonia · Ammonia_IEC62716_Double_Cert.pdf",
        "category": "Ammonia",
        "url": "https://drive.google.com/file/d/1zH4S96ef7f1dxlN7MP-Vk33AHKgp-FCB/view",
        "fileId": "1zH4S96ef7f1dxlN7MP-Vk33AHKgp-FCB"
      },
      {
        "label": "DML · DML_TUV_Double_Cert.pdf",
        "category": "DML",
        "url": "https://drive.google.com/file/d/1pdWtHtnTDhKssXGZfkacb3BfIw-txjIt/view",
        "fileId": "1pdWtHtnTDhKssXGZfkacb3BfIw-txjIt"
      },
      {
        "label": "Dust & Sand · DustSand_TUV_Double_Cert.pdf",
        "category": "Dust & Sand",
        "url": "https://drive.google.com/file/d/1O2ErvKseHevtW-XxuZE2GMBqdaMnOKGo/view",
        "fileId": "1O2ErvKseHevtW-XxuZE2GMBqdaMnOKGo"
      },
      {
        "label": "IEC 61215/61730 · IEC_61215+61730_2023_Double_Cert.pdf",
        "category": "IEC 61215/61730",
        "url": "https://drive.google.com/file/d/1ERzOxsj577zyERh3bNIIR_WdJtvP-SlJ/view",
        "fileId": "1ERzOxsj577zyERh3bNIIR_WdJtvP-SlJ"
      },
      {
        "label": "Salt Mist · SaltMist_IEC61701_L1_Double_Cert.pdf",
        "category": "Salt Mist",
        "url": "https://drive.google.com/file/d/1IqjZMvku5dOoPWdwGfq2-xQSFhxjhY33/view",
        "fileId": "1IqjZMvku5dOoPWdwGfq2-xQSFhxjhY33"
      },
      {
        "label": "Salt Mist · SaltMist_IEC61701_L6_Double_Cert.pdf",
        "category": "Salt Mist",
        "url": "https://drive.google.com/file/d/1MpDIFxFY8UYS7amsGDRFrAEsda5IrkCC/view",
        "fileId": "1MpDIFxFY8UYS7amsGDRFrAEsda5IrkCC"
      }
    ]
  },
  "LR7-60HVH": {
    "datasheet": {
      "label": "AU_Datasheet_X10_LR7-60HVH_535-560.pdf",
      "url": "https://drive.google.com/file/d/161WNRbfppzGv9c-_NQpV6NkN62hzEVsw/view",
      "fileId": "161WNRbfppzGv9c-_NQpV6NkN62hzEVsw"
    },
    "warranty": {
      "label": "AU Limited Warranty for LONGi Hi-MOX10 Solar Modules (Distributed Generation Market).pdf",
      "url": "https://drive.google.com/file/d/1WogC9cgOkVjE3mAJperyFdSuq575gaN1/view",
      "fileId": "1WogC9cgOkVjE3mAJperyFdSuq575gaN1"
    },
    "installationManual": {
      "label": "AU Installation Manual for LONGi Solar PV Modules（DGBG Only）V3.1 202511 (2).pdf",
      "url": "https://drive.google.com/file/d/1kIwLL7acAwV6S7BXyR79W11IrHDNt3CF/view",
      "fileId": "1kIwLL7acAwV6S7BXyR79W11IrHDNt3CF"
    },
    "photos": [],
    "certificates": [
      {
        "label": "Ammonia · Ammonia_IEC62716_Single_Cert.pdf",
        "category": "Ammonia",
        "url": "https://drive.google.com/file/d/1YCriwPNqHJuJi11oGEEgW1zPKQHDADAE/view",
        "fileId": "1YCriwPNqHJuJi11oGEEgW1zPKQHDADAE"
      },
      {
        "label": "DML · DML_TUV_Single_Cert.pdf",
        "category": "DML",
        "url": "https://drive.google.com/file/d/19e4dpVSgpyc40Y_o6sg5IQs7qQ2ohFp4/view",
        "fileId": "19e4dpVSgpyc40Y_o6sg5IQs7qQ2ohFp4"
      },
      {
        "label": "Dust & Sand · DustSand_TUV_Single_Cert.pdf",
        "category": "Dust & Sand",
        "url": "https://drive.google.com/file/d/1c4r_FMHRvSzrf_joHaLDh8gBcoz4zjdS/view",
        "fileId": "1c4r_FMHRvSzrf_joHaLDh8gBcoz4zjdS"
      },
      {
        "label": "IEC 61215/61730 · IEC_61215+61730_2023_Single_Cert.pdf",
        "category": "IEC 61215/61730",
        "url": "https://drive.google.com/file/d/1-3WhmmhA5gCvzoymb7Y86LRT9RpeRw5H/view",
        "fileId": "1-3WhmmhA5gCvzoymb7Y86LRT9RpeRw5H"
      },
      {
        "label": "Salt Mist · SaltMist_IEC61701_L1+L6_Single_Cert.pdf",
        "category": "Salt Mist",
        "url": "https://drive.google.com/file/d/1tCjRZhH1-LoQJeVvLz3W4zF5aHuKxTwz/view",
        "fileId": "1tCjRZhH1-LoQJeVvLz3W4zF5aHuKxTwz"
      }
    ]
  },
  "LR7-60HVD": {
    "datasheet": {
      "label": "AU_Datasheet_X10_LR7-60HVD_530-555.pdf",
      "url": "https://drive.google.com/file/d/1ZNd_r9NfK-Q1RSGa-GDHauaWGk61TR-S/view",
      "fileId": "1ZNd_r9NfK-Q1RSGa-GDHauaWGk61TR-S"
    },
    "warranty": {
      "label": "AU Limited Warranty for LONGi Hi-MOX10 Solar Modules (Distributed Generation Market).pdf",
      "url": "https://drive.google.com/file/d/17PrO69j3x0OPTiSWH1VK0I_vnh9jzagK/view",
      "fileId": "17PrO69j3x0OPTiSWH1VK0I_vnh9jzagK"
    },
    "installationManual": {
      "label": "AU Installation Manual for LONGi Solar PV Modules（DGBG Only）V3.1 202511 (2).pdf",
      "url": "https://drive.google.com/file/d/1K4SFe8KgFWQOqhXr4KwHTxqIC5ZJWvsq/view",
      "fileId": "1K4SFe8KgFWQOqhXr4KwHTxqIC5ZJWvsq"
    },
    "photos": [],
    "certificates": [
      {
        "label": "Ammonia · Ammonia_IEC62716_Double_Cert.pdf",
        "category": "Ammonia",
        "url": "https://drive.google.com/file/d/1UeveKj7zLqy3wN9eZoYUtZv5WhtDh9Le/view",
        "fileId": "1UeveKj7zLqy3wN9eZoYUtZv5WhtDh9Le"
      },
      {
        "label": "DML · DML_TUV_Double_Cert.pdf",
        "category": "DML",
        "url": "https://drive.google.com/file/d/1cS7--uxhkz92DbiiMGoeSkzcBwGX6cxE/view",
        "fileId": "1cS7--uxhkz92DbiiMGoeSkzcBwGX6cxE"
      },
      {
        "label": "Dust & Sand · DustSand_TUV_Double_Cert.pdf",
        "category": "Dust & Sand",
        "url": "https://drive.google.com/file/d/1-uDhE8sWkdHVfEivNipdav0ysFsCytin/view",
        "fileId": "1-uDhE8sWkdHVfEivNipdav0ysFsCytin"
      },
      {
        "label": "IEC 61215/61730 · IEC_61215+61730_2023_Double_Cert.pdf",
        "category": "IEC 61215/61730",
        "url": "https://drive.google.com/file/d/1c8EMPVnvLDgYFaMNzsa6WU3GFvBZDHiD/view",
        "fileId": "1c8EMPVnvLDgYFaMNzsa6WU3GFvBZDHiD"
      },
      {
        "label": "Salt Mist · SaltMist_IEC61701_L1_Double_Cert.pdf",
        "category": "Salt Mist",
        "url": "https://drive.google.com/file/d/16CuE6QK4jnNYfXTjHmSNR4_8XTU64SqM/view",
        "fileId": "16CuE6QK4jnNYfXTjHmSNR4_8XTU64SqM"
      },
      {
        "label": "Salt Mist · SaltMist_IEC61701_L6_Double_Cert.pdf",
        "category": "Salt Mist",
        "url": "https://drive.google.com/file/d/18OsT__YIYZ_QZLY7HMVMxPx4kXTVm-Ze/view",
        "fileId": "18OsT__YIYZ_QZLY7HMVMxPx4kXTVm-Ze"
      }
    ]
  },
  "LR7-60HVHL": {
    "datasheet": {
      "label": "AU_Datasheet_X10_LR7-60HVHL_535-560.pdf",
      "url": "https://drive.google.com/file/d/1Vm0_nc331Q-RO_rPZjZyKNeLgw3ufShA/view",
      "fileId": "1Vm0_nc331Q-RO_rPZjZyKNeLgw3ufShA"
    },
    "warranty": {
      "label": "AU Limited Warranty for LONGi Hi-MOX10 Solar Modules (Distributed Generation Market).pdf",
      "url": "https://drive.google.com/file/d/1S8uFV_BC-h5j11ONMkqGrGrOK-_Wz1cU/view",
      "fileId": "1S8uFV_BC-h5j11ONMkqGrGrOK-_Wz1cU"
    },
    "installationManual": {
      "label": "AU Installation Manual for LONGi Solar PV Modules（DGBG Only）V3.1 202511 (2).pdf",
      "url": "https://drive.google.com/file/d/19nQx-KirWnaNK2sFw8lIdaX6vky-1CZ8/view",
      "fileId": "19nQx-KirWnaNK2sFw8lIdaX6vky-1CZ8"
    },
    "photos": [],
    "certificates": [
      {
        "label": "Ammonia · Ammonia_IEC62716_Single_Cert.pdf",
        "category": "Ammonia",
        "url": "https://drive.google.com/file/d/1gnpNi8oAMymq8Rqj2GWdR1xBRKO4VxyF/view",
        "fileId": "1gnpNi8oAMymq8Rqj2GWdR1xBRKO4VxyF"
      },
      {
        "label": "DML · DML_TUV_Single_Cert.pdf",
        "category": "DML",
        "url": "https://drive.google.com/file/d/1LhIZMx0G8UT0Oz_GXOrHhx3lVsUM4i2H/view",
        "fileId": "1LhIZMx0G8UT0Oz_GXOrHhx3lVsUM4i2H"
      },
      {
        "label": "Dust & Sand · DustSand_TUV_Single_Cert.pdf",
        "category": "Dust & Sand",
        "url": "https://drive.google.com/file/d/1ExMWzXqVkXo3IVoFSABAEo5zT8HhFAuD/view",
        "fileId": "1ExMWzXqVkXo3IVoFSABAEo5zT8HhFAuD"
      },
      {
        "label": "IEC 61215/61730 · IEC_61215+61730_2023_Single_Cert.pdf",
        "category": "IEC 61215/61730",
        "url": "https://drive.google.com/file/d/1i6HpyeOYzruQ9VWlzSz7Eb-7CB0YysFi/view",
        "fileId": "1i6HpyeOYzruQ9VWlzSz7Eb-7CB0YysFi"
      },
      {
        "label": "Salt Mist · SaltMist_IEC61701_L1+L6_Single_Cert.pdf",
        "category": "Salt Mist",
        "url": "https://drive.google.com/file/d/1fErk31wupJ7mneGnKQKdeoRTvtJ-8va0/view",
        "fileId": "1fErk31wupJ7mneGnKQKdeoRTvtJ-8va0"
      }
    ]
  },
  "LR7-72HVD": {
    "datasheet": {
      "label": "AU_Datasheet_X10_LR7-72HVD_640-665.pdf",
      "url": "https://drive.google.com/file/d/1y4fGrXDDnMmnUNDtA_U5F-VngaEGptSN/view",
      "fileId": "1y4fGrXDDnMmnUNDtA_U5F-VngaEGptSN"
    },
    "warranty": {
      "label": "AU Limited Warranty for LONGi Hi-MOX10 Solar Modules (Distributed Generation Market).pdf",
      "url": "https://drive.google.com/file/d/15_QeiP7eu4at--rixJg52Dbf0PErfhMR/view",
      "fileId": "15_QeiP7eu4at--rixJg52Dbf0PErfhMR"
    },
    "installationManual": {
      "label": "AU Installation Manual for LONGi Solar PV Modules（DGBG Only）V3.1 202511 (2).pdf",
      "url": "https://drive.google.com/file/d/1RVW1pfZnnezQiG3s1T54faE1VMMMDsKe/view",
      "fileId": "1RVW1pfZnnezQiG3s1T54faE1VMMMDsKe"
    },
    "photos": [
      {
        "label": "Bevel view",
        "url": "https://drive.google.com/file/d/1Y8pD0CCoLrXgjivG1dqMxDB1_Oaj1oU5/view",
        "fileId": "1Y8pD0CCoLrXgjivG1dqMxDB1_Oaj1oU5"
      },
      {
        "label": "Rear view",
        "url": "https://drive.google.com/file/d/1NkipggS4OO-4pPWWbj_Rdqr8tDO_DqpG/view",
        "fileId": "1NkipggS4OO-4pPWWbj_Rdqr8tDO_DqpG"
      },
      {
        "label": "Side view",
        "url": "https://drive.google.com/file/d/1h33jAAOo1H39SbvMcWdVI7Ec1iYNN_u4/view",
        "fileId": "1h33jAAOo1H39SbvMcWdVI7Ec1iYNN_u4"
      }
    ],
    "certificates": [
      {
        "label": "Ammonia · Ammonia_IEC62716_Double_Cert.pdf",
        "category": "Ammonia",
        "url": "https://drive.google.com/file/d/1GpJflmRxsTzYlfNQh6b_LkV4tkFArD6d/view",
        "fileId": "1GpJflmRxsTzYlfNQh6b_LkV4tkFArD6d"
      },
      {
        "label": "DML · DML_TUV_Double_Cert.pdf",
        "category": "DML",
        "url": "https://drive.google.com/file/d/1G2gwlT9lNw9NqDEDFCQEokXCFK9B_9mn/view",
        "fileId": "1G2gwlT9lNw9NqDEDFCQEokXCFK9B_9mn"
      },
      {
        "label": "Dust & Sand · DustSand_TUV_Double_Cert.pdf",
        "category": "Dust & Sand",
        "url": "https://drive.google.com/file/d/1We1vA6ZLsBVT6SKt_UAdtcipaE9aZqZn/view",
        "fileId": "1We1vA6ZLsBVT6SKt_UAdtcipaE9aZqZn"
      },
      {
        "label": "IEC 61215/61730 · IEC_61215+61730_2023_Double_Cert.pdf",
        "category": "IEC 61215/61730",
        "url": "https://drive.google.com/file/d/1X3A4bD-KpVYlXijbmiRzPs7flnmx_hnC/view",
        "fileId": "1X3A4bD-KpVYlXijbmiRzPs7flnmx_hnC"
      },
      {
        "label": "Salt Mist · SaltMist_IEC61701_L1_Double_Cert.pdf",
        "category": "Salt Mist",
        "url": "https://drive.google.com/file/d/1bOwa5pEFcoIzEjf5zEIUaHYt8_xBEmQa/view",
        "fileId": "1bOwa5pEFcoIzEjf5zEIUaHYt8_xBEmQa"
      },
      {
        "label": "Salt Mist · SaltMist_IEC61701_L6_Double_Cert.pdf",
        "category": "Salt Mist",
        "url": "https://drive.google.com/file/d/1yxGmOeyrUS1jWUk4SV8f8-S4oQ3ZzFOQ/view",
        "fileId": "1yxGmOeyrUS1jWUk4SV8f8-S4oQ3ZzFOQ"
      }
    ]
  }
};

export function getProductDriveResources(
  seriesId: string
): ProductDriveResources | undefined {
  return PRODUCT_DRIVE_RESOURCES[seriesId];
}

/** 结果页左侧轮播用全部产品视角照片 */
export function getProductPhotos(seriesId: string): DriveResourceLink[] {
  const photos = getProductDriveResources(seriesId)?.photos ?? [];
  const rank = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("front")) return 0;
    if (l.includes("rear")) return 1;
    if (l.includes("side")) return 2;
    if (l.includes("bevel")) return 3;
    return 4;
  };
  return [...photos].sort((a, b) => rank(a.label) - rank(b.label));
}

/** @deprecated 使用 getProductPhotos；保留兼容旧调用 */
export function getFrontRearPhotos(seriesId: string): DriveResourceLink[] {
  return getProductPhotos(seriesId).filter((p) => {
    const label = p.label.toLowerCase();
    return label.includes("front") || label.includes("rear");
  });
}

/** Drive 预览缩略图（需文件对「知道链接的人」可见） */
export function driveThumbnailUrl(fileId: string, size = 800): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

