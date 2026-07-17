PVObject_=pvModule
  Version=7.2
  Flags=$00508443

  PVObject_Commercial=pvCommercial
    Comment=https://www.longi.com/en/
    Flags=$0041
    Manufacturer=Longi Solar
    Model=LR7-72HVHF-650M
    DataSource=TUV SUD
    YearBeg=2024
    Width=1.134
    Height=2.382
    Depth=0.030
    Weight=28.500
    NPieces=100
    PriceDate=30/04/25 19:57
    Remarks, Count=3
      Str_1
      Str_2
      Str_3
    End of Remarks
  End of PVObject pvCommercial

  Technol=mtSiMono
  NCelS=72
  NCelP=2
  NDiode=3
  SubModuleLayout=slTwinHalfCells
  FrontSurface=fsARCoating
  GRef=1000
  TRef=25.0
  PNom=650.0
  PNomTolLow=0.00
  PNomTolUp=3.00
  Isc=15.290
  Voc=53.90
  Imp=14.590
  Vmp=44.56
  muISC=7.56
  muVocSpec=-107.8
  muPmpReq=-0.260
  RShunt=1200
  Rp_0=5000
  Rp_Exp=5.50
  RSerie=0.212
  Gamma=1.077
  muGamma=-0.0001
  VMaxIEC=1500
  Absorb=0.90
  ARev=3.200
  BRev=18.144
  RDiode=0.010
  VRevDiode=-0.70
  AirMassRef=1.500
  CellArea=174.9
  SandiaAMCorr=50.000
  RelEffic800=0.34
  RelEffic600=0.36
  RelEffic400=-0.15
  RelEffic200=-1.98

  PVObject_IAM=pvIAM
    Flags=$00
    IAMMode=UserProfile
    IAMProfile=TCubicProfile
      NPtsMax=9
      NPtsEff=8
      LastCompile=$B18D
      Mode=3
      Point_1=0.0,1.00000
      Point_2=60.0,1.00000
      Point_3=65.0,0.98900
      Point_4=70.0,0.96000
      Point_5=75.0,0.90900
      Point_6=80.0,0.84100
      Point_7=85.0,0.66900
      Point_8=90.0,0.00000
      Point_9=0.0,0.00000
    End of TCubicProfile
  End of PVObject pvIAM

  OperPoints, list of=6 tOperPoint
    Point_1=True,1000,25.0,0.00,53.90,15.290,14.590,44.56,650.13
    Point_2=False,800,25.0,0.23,0.00,0.000,0.000,0.00,521.29
    Point_3=False,600,25.0,0.34,0.00,0.000,0.000,0.00,391.40
    Point_4=False,400,25.0,0.01,0.00,0.000,0.000,0.00,260.07
    Point_5=False,200,25.0,-1.95,0.00,0.000,0.000,0.00,127.49
    Point_6=False,100,25.0,-4.64,0.00,0.000,0.000,0.00,62.00
  End of List OperPoints
End of PVObject pvModule
