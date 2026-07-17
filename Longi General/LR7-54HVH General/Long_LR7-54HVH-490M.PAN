PVObject_=pvModule
  Version=7.2
  Flags=$00508443

  PVObject_Commercial=pvCommercial
    Comment=https://www.longi.com/en/
    Flags=$0041
    Manufacturer=Longi Solar
    Model=LR7-54HVH-490M
    DataSource=TUV SUD
    YearBeg=2024
    Width=1.134
    Height=1.800
    Depth=0.030
    Weight=21.600
    NPieces=100
    PriceDate=30/04/25 10:56
    Remarks, Count=3
      Str_1
      Str_2
      Str_3
    End of Remarks
  End of PVObject pvCommercial

  Technol=mtSiMono
  NCelS=54
  NCelP=2
  NDiode=3
  SubModuleLayout=slTwinHalfCells
  FrontSurface=fsARCoating
  GRef=1000
  TRef=25.0
  PNom=490.0
  PNomTolLow=0.00
  PNomTolUp=3.00
  Isc=15.330
  Voc=40.52
  Imp=14.630
  Vmp=33.51
  muISC=7.67
  muVocSpec=-81.0
  muPmpReq=-0.257
  RShunt=1240
  Rp_0=5000
  Rp_Exp=5.50
  RSerie=0.159
  Gamma=1.082
  muGamma=-0.0001
  VMaxIEC=1500
  Absorb=0.90
  ARev=3.200
  BRev=18.396
  RDiode=0.010
  VRevDiode=-0.70
  AirMassRef=1.500
  CellArea=174.9
  SandiaAMCorr=50.000
  RelEffic800=0.35
  RelEffic600=0.39
  RelEffic400=-0.10
  RelEffic200=-1.91

  PVObject_IAM=pvIAM
    Flags=$00
    IAMMode=UserProfile
    IAMProfile=TCubicProfile
      NPtsMax=9
      NPtsEff=7
      LastCompile=$B18D
      Mode=3
      Point_1=0.0,1.00000
      Point_2=60.0,1.00000
      Point_3=65.0,0.98900
      Point_4=70.0,0.96000
      Point_5=75.0,0.90900
      Point_6=80.0,0.84100
      Point_7=85.0,0.66900
      Point_8=0.0,0.00000
      Point_9=0.0,0.00000
    End of TCubicProfile
  End of PVObject pvIAM

  OperPoints, list of=6 tOperPoint
    Point_1=True,1000,25.0,0.00,40.52,15.330,14.630,33.51,490.25
    Point_2=False,800,25.0,0.25,0.00,0.000,0.000,0.00,393.17
    Point_3=False,600,25.0,0.35,39.58,8.930,8.487,34.71,294.58
    Point_4=False,400,25.0,0.05,39.14,5.969,5.664,34.54,195.63
    Point_5=False,200,25.0,-1.94,38.28,3.027,2.830,33.90,95.94
    Point_6=False,100,25.0,-4.41,37.34,1.554,1.415,33.07,46.79
  End of List OperPoints
End of PVObject pvModule
