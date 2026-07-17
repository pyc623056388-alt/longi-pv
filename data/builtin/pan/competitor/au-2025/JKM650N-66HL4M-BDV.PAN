PVObject_=pvModule
  Version=7.4.2
  Flags=$00900043

  PVObject_Commercial=pvCommercial
    Comment=www.jinkosolar.com
    Flags=$0041
    Manufacturer=Jinko Solar Co., Ltd.
    Model=JKM650N-66HL4M-BDV
    DataSource=TÜV NORD
    YearBeg=2024
    Width=1.134
    Height=2.382
    Depth=0.030
    Weight=32.400
    NPieces=100
    PriceDate=25/04/24 11:09
    Remarks, Count=5
      Str_1=- All measurements and PAN file creation have been completed by TÜV NORD
      Str_2=- Refer to report TRPVP06135/24P/04 for additional information.
      Str_3=-Black anodized aluminum
      Str_4=-2.0 glass / Encapsulation / 2.0 glass
      Str_5=-Jbox IP 68, 3 diodes
    End of Remarks=-Jbox IP 68, 3 diodes
  End of PVObject pvCommercial

  Technol=mtSiMono
  NCelS=66
  NCelP=2
  NDiode=3
  SubModuleLayout=slTwinHalfCells
  FrontSurface=fsARCoating
  GRef=1000
  TRef=25.0
  PNom=650.0
  PNomTolLow=0.00
  PNomTolUp=3.00
  BifacialityFactor=0.820
  Isc=16.440
  Voc=50.28
  Imp=15.640
  Vmp=41.58
  muISC=7.43
  muVocSpec=-122.3
  muPmpReq=-0.271
  RShunt=3500
  Rp_0=16000
  Rp_Exp=5.50
  RSerie=0.191
  Gamma=1.110
  muGamma=-0.0003
  VMaxIEC=1500
  Absorb=0.90
  ARev=3.200
  BRev=18.804
  RDiode=0.010
  VRevDiode=-0.70
  AirMassRef=1.500
  CellWidth=0.182
  CellHeight=0.105
  SandiaAMCorr=50.000
  RelEffic800=-0.21
  RelEffic600=-0.26
  RelEffic400=-0.59
  RelEffic200=-1.87

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
      Point_3=50.0,1.00000
      Point_4=60.0,0.99900
      Point_5=70.0,0.99400
      Point_6=75.0,0.97900
      Point_7=80.0,0.92500
      Point_8=85.0,0.72700
      Point_9=90.0,0.00000
    End of TCubicProfile
  End of PVObject pvIAM

  OperPoints, list of=6 tOperPoint
    Point_1=False,1100,25.0,0.09,48.99,15.750,15.080,42.50,640.90
    Point_2=True,1000,25.0,0.00,48.99,15.750,15.080,42.50,640.90
    Point_3=False,800,25.0,-0.21,0.00,0.000,0.000,0.00,511.63
    Point_4=False,600,25.0,-0.26,0.00,0.000,0.000,0.00,383.53
    Point_5=False,400,25.0,-0.59,0.00,0.000,0.000,0.00,254.84
    Point_6=False,200,25.0,-1.87,0.00,0.000,0.000,0.00,125.60
  End of List OperPoints
End of PVObject pvModule
