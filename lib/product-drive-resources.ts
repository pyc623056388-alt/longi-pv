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
  },
  "LR7-72HVH": {
  "photos": [
    {
      "label": "Front view",
      "url": "https://drive.google.com/file/d/1PLpXElDoJtJXs0eQsClajsxICYlR5eix/view",
      "fileId": "1PLpXElDoJtJXs0eQsClajsxICYlR5eix"
    },
    {
      "label": "Rear view",
      "url": "https://drive.google.com/file/d/1dKtTUVQ0JrSk0RqH60u_7qdZswTLGEU8/view",
      "fileId": "1dKtTUVQ0JrSk0RqH60u_7qdZswTLGEU8"
    },
    {
      "label": "Side view",
      "url": "https://drive.google.com/file/d/1UHiRVgqtPrmX4bUb4MxavrBxwnDFbtAc/view",
      "fileId": "1UHiRVgqtPrmX4bUb4MxavrBxwnDFbtAc"
    },
    {
      "label": "Bevel view",
      "url": "https://drive.google.com/file/d/1TUER25PZBCHuMQTpW5SEPBQhJtfhJ0oU/view",
      "fileId": "1TUER25PZBCHuMQTpW5SEPBQhJtfhJ0oU"
    }
  ],
  "certificates": [
    {
      "label": "Ammonia · Ammonia_IEC62716_Single_Cert.pdf",
      "url": "https://drive.google.com/file/d/191UOxPY4Lon6Xv21z46fbYkxWvC1ENZQ/view",
      "fileId": "191UOxPY4Lon6Xv21z46fbYkxWvC1ENZQ",
      "category": "Ammonia"
    },
    {
      "label": "DML · DML_TUV_Single_Cert.pdf",
      "url": "https://drive.google.com/file/d/1y8eMHpRl4l4HI_YcEyZdaaSQZTJ0QUys/view",
      "fileId": "1y8eMHpRl4l4HI_YcEyZdaaSQZTJ0QUys",
      "category": "DML"
    },
    {
      "label": "Dust & Sand · DustSand_TUV_Single_Cert.pdf",
      "url": "https://drive.google.com/file/d/16MjaWGmqbQhUHA0j2MRMh28jrmMHyBjS/view",
      "fileId": "16MjaWGmqbQhUHA0j2MRMh28jrmMHyBjS",
      "category": "Dust & Sand"
    },
    {
      "label": "IEC 61215/61730 · IEC_61215+61730_2023_Single_Cert.pdf",
      "url": "https://drive.google.com/file/d/1vg-DC3af6fHw45a9e6TGR_RuPai0iVzE/view",
      "fileId": "1vg-DC3af6fHw45a9e6TGR_RuPai0iVzE",
      "category": "IEC 61215/61730"
    },
    {
      "label": "Salt Mist · SaltMist_IEC61701_L1+L6_Single_Cert.pdf",
      "url": "https://drive.google.com/file/d/1RckInoT2cNi4dT0opYMYMgogVI6_-Pqw/view",
      "fileId": "1RckInoT2cNi4dT0opYMYMgogVI6_-Pqw",
      "category": "Salt Mist"
    }
  ],
  "datasheet": {
    "label": "AU_Datasheet_X10_LR7-72HVH_645-670.pdf",
    "url": "https://drive.google.com/file/d/1dclGKCrD2YoeHoK2Vi3M5HUV4A9nJfkh/view",
    "fileId": "1dclGKCrD2YoeHoK2Vi3M5HUV4A9nJfkh"
  },
  "installationManual": {
    "label": "AU Installation Manual for LONGi Solar PV Modules（DGBG Only）V3.1 202511 (2).pdf",
    "url": "https://drive.google.com/file/d/16t7ANkxnmolm9pV76GoJsSsMFHDAEX46/view",
    "fileId": "16t7ANkxnmolm9pV76GoJsSsMFHDAEX46"
  },
  "warranty": {
    "label": "AU Limited Warranty for LONGi Hi-MOX10 Solar Modules (Distributed Generation Market).pdf",
    "url": "https://drive.google.com/file/d/1y1hFs-Fwq2KKPNufkAVPDMWlh9WTVlax/view",
    "fileId": "1y1hFs-Fwq2KKPNufkAVPDMWlh9WTVlax"
  }
},
  "LR7-72HVHF": {
  "photos": [
    {
      "label": "Front view",
      "url": "https://drive.google.com/file/d/1iyZXtCg8DDpJuj1C98mRQI7YUgY_9GIG/view",
      "fileId": "1iyZXtCg8DDpJuj1C98mRQI7YUgY_9GIG"
    },
    {
      "label": "Rear view",
      "url": "https://drive.google.com/file/d/1y_T5dxpBUECsU6DNEbFb6BgM6WrB9gug/view",
      "fileId": "1y_T5dxpBUECsU6DNEbFb6BgM6WrB9gug"
    },
    {
      "label": "Side view",
      "url": "https://drive.google.com/file/d/14bMuC1svlZYtbIpEv7HP-mv35f-wLykI/view",
      "fileId": "14bMuC1svlZYtbIpEv7HP-mv35f-wLykI"
    },
    {
      "label": "Bevel view",
      "url": "https://drive.google.com/file/d/1XsJNW7EdWtIzyWtr3H-QA5QY-nIE6uTE/view",
      "fileId": "1XsJNW7EdWtIzyWtr3H-QA5QY-nIE6uTE"
    }
  ],
  "certificates": [
    {
      "label": "Ammonia · Ammonia_IEC62716_Single_Cert.pdf",
      "url": "https://drive.google.com/file/d/1SP8QbdP90Mz62lS78gL5_TBeeEbk5q9o/view",
      "fileId": "1SP8QbdP90Mz62lS78gL5_TBeeEbk5q9o",
      "category": "Ammonia"
    },
    {
      "label": "DML · DML_TUV_Single_Cert.pdf",
      "url": "https://drive.google.com/file/d/19xk1tXhFFsA2A9FXsiOGDiIwGC_IOGaC/view",
      "fileId": "19xk1tXhFFsA2A9FXsiOGDiIwGC_IOGaC",
      "category": "DML"
    },
    {
      "label": "Dust & Sand · DustSand_TUV_Single_Cert.pdf",
      "url": "https://drive.google.com/file/d/1FSLjH_sK1Mglv8n9XPfNzC5D8QIcyeED/view",
      "fileId": "1FSLjH_sK1Mglv8n9XPfNzC5D8QIcyeED",
      "category": "Dust & Sand"
    },
    {
      "label": "Hail · Hail_35+45mm_IEC61215_LR7-72HVHF_Cert.pdf",
      "url": "https://drive.google.com/file/d/1WD_d5dsVT6wVX0-8oN-PPcBW6lafZa66/view",
      "fileId": "1WD_d5dsVT6wVX0-8oN-PPcBW6lafZa66",
      "category": "Hail"
    },
    {
      "label": "IEC 61215/61730 · IEC_61215+61730_2023_Single_Cert.pdf",
      "url": "https://drive.google.com/file/d/15MM2hN6ag-_d5LZy5lG-Kkbt98PGY-NV/view",
      "fileId": "15MM2hN6ag-_d5LZy5lG-Kkbt98PGY-NV",
      "category": "IEC 61215/61730"
    },
    {
      "label": "Salt Mist · SaltMist_IEC61701_L1+L6_Single_Cert.pdf",
      "url": "https://drive.google.com/file/d/1dFGd9trv72t60RmVYIPput51mAtI80kQ/view",
      "fileId": "1dFGd9trv72t60RmVYIPput51mAtI80kQ",
      "category": "Salt Mist"
    }
  ],
  "datasheet": {
    "label": "AU_Datasheet_X10_LR7-72HVHF_640-670.pdf",
    "url": "https://drive.google.com/file/d/1NCnF5_NqyBddvGj9usbes9isyVtsIxoh/view",
    "fileId": "1NCnF5_NqyBddvGj9usbes9isyVtsIxoh"
  },
  "installationManual": {
    "label": "AU Installation Manual for LONGi Solar PV Modules（DGBG Only）V3.1 202511 (2).pdf",
    "url": "https://drive.google.com/file/d/1mpzNcFB5_SDP9x_Jz_MOXiqVNy-p6yFo/view",
    "fileId": "1mpzNcFB5_SDP9x_Jz_MOXiqVNy-p6yFo"
  },
  "warranty": {
    "label": "AU Limited Warranty for LONGi Hi-MOX10 Solar Modules (Distributed Generation Market).pdf",
    "url": "https://drive.google.com/file/d/1ElaTxv_gOXNrJ2pG1VD347rWYK9NnTnL/view",
    "fileId": "1ElaTxv_gOXNrJ2pG1VD347rWYK9NnTnL"
  }
},
  "LR7-72HVDF": {
  "photos": [
    {
      "label": "Front view",
      "url": "https://drive.google.com/file/d/18LEMH9lKP4s53H03RxvmvWhRMVEHeDjf/view",
      "fileId": "18LEMH9lKP4s53H03RxvmvWhRMVEHeDjf"
    },
    {
      "label": "Rear view",
      "url": "https://drive.google.com/file/d/1oJzo3cv4CS41O8zEZNY_NsO0TCwANgfn/view",
      "fileId": "1oJzo3cv4CS41O8zEZNY_NsO0TCwANgfn"
    },
    {
      "label": "Side view",
      "url": "https://drive.google.com/file/d/1PuDSlb0t79ONb72m4nEMt9YgTfwuz36P/view",
      "fileId": "1PuDSlb0t79ONb72m4nEMt9YgTfwuz36P"
    },
    {
      "label": "Bevel view",
      "url": "https://drive.google.com/file/d/17UhFFqhFNNakmlWnRdb-nxW-OlvOOfpi/view",
      "fileId": "17UhFFqhFNNakmlWnRdb-nxW-OlvOOfpi"
    }
  ],
  "certificates": [
    {
      "label": "Ammonia · Ammonia_IEC62716_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1AuUtJSLY-yRYLA7DUZN4C8idOt72tiJ9/view",
      "fileId": "1AuUtJSLY-yRYLA7DUZN4C8idOt72tiJ9",
      "category": "Ammonia"
    },
    {
      "label": "DML · DML_TUV_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1u0NOkYe1d8qAS3UqPjeTd4zcgij4_XUD/view",
      "fileId": "1u0NOkYe1d8qAS3UqPjeTd4zcgij4_XUD",
      "category": "DML"
    },
    {
      "label": "Dust & Sand · DustSand_TUV_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1ORrLvI4q6Qe3x5fqT-LF14lWtgWgbfwC/view",
      "fileId": "1ORrLvI4q6Qe3x5fqT-LF14lWtgWgbfwC",
      "category": "Dust & Sand"
    },
    {
      "label": "Hail · Hail_35+45mm_IEC61215_LR7-54HVB+54HVD+72HVDF_Cert.pdf",
      "url": "https://drive.google.com/file/d/1SdiUvvVqvoiB6h8v9AfCIqVyA11I5H19/view",
      "fileId": "1SdiUvvVqvoiB6h8v9AfCIqVyA11I5H19",
      "category": "Hail"
    },
    {
      "label": "IEC 61215/61730 · IEC_61215+61730_2023_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1LaXJQr6S4JRSo0dl01Vsu1f7M10sF0xP/view",
      "fileId": "1LaXJQr6S4JRSo0dl01Vsu1f7M10sF0xP",
      "category": "IEC 61215/61730"
    },
    {
      "label": "Salt Mist · SaltMist_IEC61701_L1_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1BtMjNfr9Phf9JyzhRUgBpxDK3Lq8g6YC/view",
      "fileId": "1BtMjNfr9Phf9JyzhRUgBpxDK3Lq8g6YC",
      "category": "Salt Mist"
    },
    {
      "label": "Salt Mist · SaltMist_IEC61701_L6_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1Ln-jlVEUpmq5-94135mSp8kebGxgaJ8D/view",
      "fileId": "1Ln-jlVEUpmq5-94135mSp8kebGxgaJ8D",
      "category": "Salt Mist"
    }
  ],
  "datasheet": {
    "label": "AU_Datasheet_X10_LR7-72HVDF_640-665.pdf",
    "url": "https://drive.google.com/file/d/1PrUuz21oJQPxl0vRVtbltwglHnwhE_r0/view",
    "fileId": "1PrUuz21oJQPxl0vRVtbltwglHnwhE_r0"
  },
  "installationManual": {
    "label": "AU Installation Manual for LONGi Solar PV Modules（DGBG Only）V3.1 202511 (2).pdf",
    "url": "https://drive.google.com/file/d/1fvFzTxNoOtmg-rqH9Sykc4x_wseVFXhC/view",
    "fileId": "1fvFzTxNoOtmg-rqH9Sykc4x_wseVFXhC"
  },
  "warranty": {
    "label": "AU Limited Warranty for LONGi Hi-MOX10 Solar Modules (Distributed Generation Market).pdf",
    "url": "https://drive.google.com/file/d/1LX2gyJleRLPOh-c3QY2jdXXa-Yo0szei/view",
    "fileId": "1LX2gyJleRLPOh-c3QY2jdXXa-Yo0szei"
  }
},
  "LR8-66HVD": {
  "photos": [
    {
      "label": "Front view",
      "url": "https://drive.google.com/file/d/13vJUhR9UHmufrguaVflB6kb2zsf6xifS/view",
      "fileId": "13vJUhR9UHmufrguaVflB6kb2zsf6xifS"
    },
    {
      "label": "Rear view",
      "url": "https://drive.google.com/file/d/1Ba34z-jNe-f5cU8_4hCkJteX-cfiw4nQ/view",
      "fileId": "1Ba34z-jNe-f5cU8_4hCkJteX-cfiw4nQ"
    },
    {
      "label": "Side view",
      "url": "https://drive.google.com/file/d/1cZ72NZBPQYuMJITa-d8D8gAGBYXq_fp_/view",
      "fileId": "1cZ72NZBPQYuMJITa-d8D8gAGBYXq_fp_"
    },
    {
      "label": "Bevel view",
      "url": "https://drive.google.com/file/d/1MSeMXyFa63FGu-hkGKgIFyUN11htJhVF/view",
      "fileId": "1MSeMXyFa63FGu-hkGKgIFyUN11htJhVF"
    }
  ],
  "certificates": [
    {
      "label": "Ammonia · Ammonia_IEC62716_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1tDycn1JGFPdqBrZwTXKHz9HXw608JYVx/view",
      "fileId": "1tDycn1JGFPdqBrZwTXKHz9HXw608JYVx",
      "category": "Ammonia"
    },
    {
      "label": "DML · DML_TUV_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1geMQer4g-FHobFbYjBrHycuKfNRYLO8Z/view",
      "fileId": "1geMQer4g-FHobFbYjBrHycuKfNRYLO8Z",
      "category": "DML"
    },
    {
      "label": "Dust & Sand · DustSand_TUV_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1Dfa7C7x5T2cKxLpQfScfwkisVhH26BVt/view",
      "fileId": "1Dfa7C7x5T2cKxLpQfScfwkisVhH26BVt",
      "category": "Dust & Sand"
    },
    {
      "label": "IEC 61215/61730 · IEC_61215+61730_2023_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1bNBZEydWb3StAwXrdZbV9fzh6bfdK7_8/view",
      "fileId": "1bNBZEydWb3StAwXrdZbV9fzh6bfdK7_8",
      "category": "IEC 61215/61730"
    },
    {
      "label": "Salt Mist · SaltMist_IEC61701_L1_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1uuZ5yXVzyBm4ArvW3qfaAzaOCSuOT2_Y/view",
      "fileId": "1uuZ5yXVzyBm4ArvW3qfaAzaOCSuOT2_Y",
      "category": "Salt Mist"
    },
    {
      "label": "Salt Mist · SaltMist_IEC61701_L6_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1SLBnebZIoeBQ4wrSroXCrXPJi5VJePC4/view",
      "fileId": "1SLBnebZIoeBQ4wrSroXCrXPJi5VJePC4",
      "category": "Salt Mist"
    }
  ],
  "datasheet": {
    "label": "AU_Datasheet_X10_LR8-66HVD_640-670.pdf",
    "url": "https://drive.google.com/file/d/1l-3_9h1MAac5z99o-gM_34dDKG-Qjfh0/view",
    "fileId": "1l-3_9h1MAac5z99o-gM_34dDKG-Qjfh0"
  },
  "installationManual": {
    "label": "AU Installation Manual for LONGi Solar PV Modules（DGBG Only）V3.1 202511 (2).pdf",
    "url": "https://drive.google.com/file/d/1UW3j_q2gR0CRrq0Dknmj_GwG5YUf11Tg/view",
    "fileId": "1UW3j_q2gR0CRrq0Dknmj_GwG5YUf11Tg"
  },
  "warranty": {
    "label": "AU Limited Warranty for LONGi Hi-MOX10 Solar Modules (Distributed Generation Market).pdf",
    "url": "https://drive.google.com/file/d/122ME5GRVzAed7OcxHqzt0gunjKg8HbNq/view",
    "fileId": "122ME5GRVzAed7OcxHqzt0gunjKg8HbNq"
  }
},
  "LR8-66HVDF": {
  "photos": [],
  "certificates": [
    {
      "label": "Ammonia · Ammonia_IEC62716_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1IdXBhAAfb_KAEF4adqtNfGKgHJuztX_p/view",
      "fileId": "1IdXBhAAfb_KAEF4adqtNfGKgHJuztX_p",
      "category": "Ammonia"
    },
    {
      "label": "DML · DML_TUV_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1ysZkZWY6x2DK1dIkuH40lrEYBmgiCHjc/view",
      "fileId": "1ysZkZWY6x2DK1dIkuH40lrEYBmgiCHjc",
      "category": "DML"
    },
    {
      "label": "Dust & Sand · DustSand_TUV_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1FMA2efBvjNgld2CKkbZY5WUJ9OGrs_go/view",
      "fileId": "1FMA2efBvjNgld2CKkbZY5WUJ9OGrs_go",
      "category": "Dust & Sand"
    },
    {
      "label": "IEC 61215/61730 · IEC_61215+61730_2023_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1j5el8EEI4kU9XLP7rYVErmz3yGtVWvnE/view",
      "fileId": "1j5el8EEI4kU9XLP7rYVErmz3yGtVWvnE",
      "category": "IEC 61215/61730"
    },
    {
      "label": "Salt Mist · SaltMist_IEC61701_L1_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1Ov3kuEqsGJRDyHaPP1zMJSu31d4C8F-M/view",
      "fileId": "1Ov3kuEqsGJRDyHaPP1zMJSu31d4C8F-M",
      "category": "Salt Mist"
    },
    {
      "label": "Salt Mist · SaltMist_IEC61701_L6_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1mKYjsSio6WLpy92IQHA1ECZyf-3PtFrF/view",
      "fileId": "1mKYjsSio6WLpy92IQHA1ECZyf-3PtFrF",
      "category": "Salt Mist"
    }
  ],
  "datasheet": {
    "label": "AU_Datasheet_X10_LR8-66HVDF_640-665.pdf",
    "url": "https://drive.google.com/file/d/1GPG0EU_O4BUZ6afD9uls4IshprY7yByx/view",
    "fileId": "1GPG0EU_O4BUZ6afD9uls4IshprY7yByx"
  },
  "installationManual": {
    "label": "AU Installation Manual for LONGi Solar PV Modules（DGBG Only）V3.1 202511 (2).pdf",
    "url": "https://drive.google.com/file/d/1Edh52KZ9ssU7gtUFupmkYSgDoUNDFbCm/view",
    "fileId": "1Edh52KZ9ssU7gtUFupmkYSgDoUNDFbCm"
  },
  "warranty": {
    "label": "AU Limited Warranty for LONGi Hi-MOX10 Solar Modules (Distributed Generation Market).pdf",
    "url": "https://drive.google.com/file/d/1geTQ7NWCw3lQgl1pndN4UXjKLuZKMNfZ/view",
    "fileId": "1geTQ7NWCw3lQgl1pndN4UXjKLuZKMNfZ"
  }
},
  "LR8-66HYD": {
  "photos": [],
  "certificates": [
    {
      "label": "Ammonia · Ammonia_IEC62716_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1jIzb50_E5WIr5f4SFyjh3aEPX_x_e10v/view",
      "fileId": "1jIzb50_E5WIr5f4SFyjh3aEPX_x_e10v",
      "category": "Ammonia"
    },
    {
      "label": "Degradation · Degradation_UV30+UV30+UV60_LR8-66HYD_Report.pdf",
      "url": "https://drive.google.com/file/d/1JcNtKZdCRB5173sJVX3Gw9gHojuKs5XF/view",
      "fileId": "1JcNtKZdCRB5173sJVX3Gw9gHojuKs5XF",
      "category": "Degradation"
    },
    {
      "label": "DML · DML_TUV_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1ows-oyWcUKn6LejUxp8Y4Eyaxbbg5d6Y/view",
      "fileId": "1ows-oyWcUKn6LejUxp8Y4Eyaxbbg5d6Y",
      "category": "DML"
    },
    {
      "label": "Dust & Sand · DustSand_TUV_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1dAT_sLfh3RS2RCtg3yUhSfFMiM9tqnk3/view",
      "fileId": "1dAT_sLfh3RS2RCtg3yUhSfFMiM9tqnk3",
      "category": "Dust & Sand"
    },
    {
      "label": "Fire · Fire_ClassA_LR8-66HYD_Report.pdf",
      "url": "https://drive.google.com/file/d/1Es1hOLjffXv7WxcU99SxtRhQNbhorQU6/view",
      "fileId": "1Es1hOLjffXv7WxcU99SxtRhQNbhorQU6",
      "category": "Fire"
    },
    {
      "label": "Hail · Hail_45mm_Glass2.8+2_LR8-66HYD_Report.pdf",
      "url": "https://drive.google.com/file/d/1Ule_06tt_RwzJ3zC7J-_8tyNqCgtUWZ0/view",
      "fileId": "1Ule_06tt_RwzJ3zC7J-_8tyNqCgtUWZ0",
      "category": "Hail"
    },
    {
      "label": "Hail · Hail_55mm_Angle30_Glass2.8+2_LR8-66HYD_Report.pdf",
      "url": "https://drive.google.com/file/d/149HFt3wB6ezimrB0LrezoQg6O0H0c18C/view",
      "fileId": "149HFt3wB6ezimrB0LrezoQg6O0H0c18C",
      "category": "Hail"
    },
    {
      "label": "Hail · Hail_55mm_Angle30_Glass3.2+2_LR8-66HYD_Report.pdf",
      "url": "https://drive.google.com/file/d/1mU9f7bbWT5ey_LfO1y6O2M4Strl4DcmJ/view",
      "fileId": "1mU9f7bbWT5ey_LfO1y6O2M4Strl4DcmJ",
      "category": "Hail"
    },
    {
      "label": "Hail · Hail_65mm_Angle60_Glass2.8+2_LR8-66HYD_Report.pdf",
      "url": "https://drive.google.com/file/d/1BtKUXYAP_LMo7osLHZxmWZf6j5KijWbL/view",
      "fileId": "1BtKUXYAP_LMo7osLHZxmWZf6j5KijWbL",
      "category": "Hail"
    },
    {
      "label": "Hail · Hail_HW4_VKF_Glass3.2+2_LR8-66HYD_Report.pdf",
      "url": "https://drive.google.com/file/d/1lwY0Jp_vOU1byTf18z2dP90his645lMy/view",
      "fileId": "1lwY0Jp_vOU1byTf18z2dP90his645lMy",
      "category": "Hail"
    },
    {
      "label": "IEC 61215/61730 · IEC_61215+61730_2023_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/16jF2ZaR_6JAoy1mr2KjCau0A-eDp5Mf2/view",
      "fileId": "16jF2ZaR_6JAoy1mr2KjCau0A-eDp5Mf2",
      "category": "IEC 61215/61730"
    },
    {
      "label": "Salt Mist · SaltMist_IEC61701_L1_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1VIkTxsDjnmDJZ7hi9Cr0Fk0x6IFmYWfw/view",
      "fileId": "1VIkTxsDjnmDJZ7hi9Cr0Fk0x6IFmYWfw",
      "category": "Salt Mist"
    },
    {
      "label": "Salt Mist · SaltMist_IEC61701_L6_Double_Cert.pdf",
      "url": "https://drive.google.com/file/d/1IgK6jl2Ek7ii4AImX8oww9nIBNfxBAyx/view",
      "fileId": "1IgK6jl2Ek7ii4AImX8oww9nIBNfxBAyx",
      "category": "Salt Mist"
    },
    {
      "label": "Salt Mist · SaltMist_IEC61701_L8_LR8-66HYD_TRF.pdf",
      "url": "https://drive.google.com/file/d/12X_d6UjCf9Yab4TXNPukK4oTf88J-M4B/view",
      "fileId": "12X_d6UjCf9Yab4TXNPukK4oTf88J-M4B",
      "category": "Salt Mist"
    }
  ],
  "datasheet": {
    "label": "Datasheet_LR8-66HYD_Glass2.0+2_635-670_V5.0_EN.pdf",
    "url": "https://drive.google.com/file/d/1DTqraoKLC2cspc9fBrBUluLxYIZvke0H/view",
    "fileId": "1DTqraoKLC2cspc9fBrBUluLxYIZvke0H"
  },
  "installationManual": {
    "label": "Installation Manual for LONGi Solar PV Modules V20-Ice shield-Draft -EN (1).pdf",
    "url": "https://drive.google.com/file/d/1cU8d0t_yx0rrYodrToPYgbhj4qGM2nSa/view",
    "fileId": "1cU8d0t_yx0rrYodrToPYgbhj4qGM2nSa"
  },
  "warranty": {
    "label": "Limited Warranty for LONGi PV Modules (HE Bifacial Series of Dual Glass).pdf",
    "url": "https://drive.google.com/file/d/1rVLYgi7572KHhjn2TJv9eqekHZwIV0TD/view",
    "fileId": "1rVLYgi7572KHhjn2TJv9eqekHZwIV0TD"
  }
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

