PVObject_=pvModule
  Version=8.0
  Flags=$00900443

  PVObject_Commercial=pvCommercial
    Comment=LONGi Green Energy Technology Co., Ltd.
    Flags=$0041
    Manufacturer=LONGi Green Energy Technology Co., Ltd.
    Model=LR7-60HVHL-545M
    DataSource=TÜV Rheinland (Shanghai) Co., Ltd.
    Width=1.134
    Height=1.990
    Depth=0.030
    NPieces=100
    PriceDate=18/07/25 16:03
    Remarks, Count=51
      Str_1=Disclaimer: The current PAN file is valid only for PV-module type LR7-60HVHL-545M with BOM as stated below.
      Str_2=TUV Rheinland (Shanghai) Co., Ltd. is not responsible for any modifications of this PAN file.
      Str_3
      Str_4=- All measurements and PAN file creation have been completed by TUV Rheinland (Shanghai) Co.,Ltd.
      Str_5=- Refer to project 326114302 for additional information.
      Str_6
      Str_7=I- Light Induced Degradation (LID)
      Str_8
      Str_9=- LID has been performed by TUV Rheinland(Shanghai) Co., Ltd. and modules reached stabilized condition prior the measurements.
      Str_10=Hence, the LID factor has been already considered in the PAN file creation.
      Str_11
      Str_12=II-Constructional Data Form of module type LR7-60HVHL-545M
      Str_13
      Str_14=Solar Cell	LONGi Solar Technology Co., Ltd	M11M0B
      Str_15=Encapsulation	LONGi Green Energy Technology Co.,Ltd.	LRPT/LREW
      Str_16=Glass 	Changzhou Almaden Co.,Ltd.
      Str_17=LONGi Green Energy Technology Co., Ltd	1.6mm
      Str_18=Backsheet	Suzhou First PV Material Co., Ltd.	BEC-301D
      Str_19=Frame 	LONGi Green Energy Technology Co., Ltd	6005-T6
      Str_20=Long side:30x30mm
      Str_21=Short side:30x15mm
      Str_22=Middle side:20.5x20mm
      Str_23=Adhesive of frame sealing	Sika (Jiangsu) industrial Material Ltd. 	 SIKASIL® AS-165
      Str_24=Junction
      Str_25=box	LONGi Green Energy Technology Co., Ltd	 PV-LR07A
      Str_26=Connector	LONGi Green Energy Technology Co., Ltd	PV-LR5
      Str_27=Cable	LONGi Green Energy Technology Co., Ltd	62930 IEC 131 1×4mm2, 1500V DC, -40 °C to 90 °C
      Str_28=Bypass Diode	LONGi Green Energy Technology Co., Ltd	30SQ045
      Str_29=Adhesive of J-Box sealing	Sika (Jiangsu) industrial Material Ltd. 	 SIKASIL® AS-165
      Str_30=Potting Material in junction box (if applicable)	Sika (Jiangsu) industrial Material Ltd. 	 SIKASIL® AS-747 SL
      Str_31=Interconnector of cells	TONYSHARE(Suzhou) Electronic Material Technology Co., Ltd
      Str_32=LONGi Green Energy Technology Co., Ltd	Base Cu60Al40
      Str_33=Coating:Sn60Pb40
      Str_34=0.25*0.6mm
      Str_35=Interconnector of strings	TONYSHARE(Suzhou) Electronic Material Technology Co., Ltd
      Str_36=LONGi Green Energy Technology Co., Ltd	Base Cu
      Str_37=Coating:Sn50Pb50
      Str_38=0.3*6mm
      Str_39=0.3*3.5mm
      Str_40=light reflecting
      Str_41=Fluxing agent-1	Asahi Solder Technology (Wuxi) Co. Ltd . 	SF105
      Str_42=Fixing Tape1 (if applicable)	3M China Ltd. 	UV-1
      Str_43=Fixing Tape2 (if applicable)	LONGi Green Energy Technology Co., Ltd	BCP-1W
      Str_44=Insulation tape	 3M China Ltd. 	D300
      Str_45=Soldering paste	BEIJING COMPO ADVANCED TECHNOLOGY CO.,LTD	SRT901-ZF-4-ZXZ01
      Str_46=Insulation glue	JIANGSU KUANGSHUN PHOTOSENSITIVITY NEW-MATERIAL STOCK CO., LTD. 	KSM-386GY
      Str_47=Lable	AVERY	PET
      Str_48
      Str_49=Remark:
      Str_50=- The above material components are provided by applicant.
      Str_51=- Applicant: LONGi Green Energy Technology Co., Ltd.
    End of Remarks=- Applicant: LONGi Green Energy Technology Co., Ltd.
  End of PVObject pvCommercial

  Technol=mtSiMono
  NCelS=60
  NCelP=2
  NDiode=3
  SubModuleLayout=slExotic
  FrontSurface=fsNormalGlass
  GRef=1000
  TRef=25.0
  PNom=545.0
  PNomTolUp=3.00
  BifacialityFactor=0.000
  Isc=14.966
  Voc=45.49
  Imp=14.179
  Vmp=38.45
  muISC=4.34
  muPmpReq=-0.264
  RShunt=500
  Rp_0=2000
  Rp_Exp=5.50
  RSerie=0.034
  Gamma=1.399
  muGamma=0.0001
  VMaxIEC=1500
  VMaxUL=1500
  Absorb=0.90
  ARev=3.200
  BRev=-11998.800
  RDiode=0.010
  VRevDiode=-0.70
  AirMassRef=1.500
  SandiaAMCorr=50.000
  RelEffic800=-0.04
  RelEffic600=-0.47
  RelEffic400=-1.68
  RelEffic200=-4.51

  PVObject_IAM=pvIAM
    Flags=$00
    IAMMode=UserProfile
    IAMProfile=TCubicProfile
      NPtsMax=9
      NPtsEff=9
      LastCompile=$B18D
      Mode=3
      Point_1=0.0,1.00000
      Point_2=30.0,1.00000
      Point_3=50.0,0.99800
      Point_4=60.0,0.99200
      Point_5=70.0,0.96400
      Point_6=75.0,0.91900
      Point_7=80.0,0.81400
      Point_8=85.0,0.57100
      Point_9=90.0,0.00000
    End of TCubicProfile
  End of PVObject pvIAM

  OperPoints, list of=7 tOperPoint
    Point_1=True,1100,25.0,-0.02,44.82,16.550,15.665,38.29,599.81
    Point_2=True,1000,25.0,0.00,45.49,14.966,14.179,38.45,545.18
    Point_3=True,800,25.0,-0.07,44.43,12.039,11.343,38.44,436.02
    Point_4=True,600,25.0,-0.50,44.07,9.029,8.515,38.24,325.61
    Point_5=True,400,25.0,-1.71,43.52,6.024,5.667,37.84,214.44
    Point_6=True,200,25.0,-4.53,42.52,3.027,2.813,37.02,104.14
    Point_7=True,100,25.0,-8.49,41.48,1.514,1.391,35.88,49.91
  End of List OperPoints
End of PVObject pvModule
