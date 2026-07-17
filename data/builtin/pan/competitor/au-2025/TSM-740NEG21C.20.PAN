PVObject_=pvModule
  Version=7.4.0
  Flags=$00D00043

  PVObject_Commercial=pvCommercial
    Flags=$0041
    Manufacturer=Trina Solar
    Model=TSM-740NEG21C.20
    DataSource=DEKRA Testing and Certification
    Width=1.303
    Height=2.384
    Depth=0.033
    Weight=38.300
    NPieces=100
    PriceDate=10/03/21 13:49
  End of PVObject pvCommercial

  Technol=mtSiMono
  NCelS=66
  NCelP=2
  NDiode=3
  SubModuleLayout=slTwinHalfCells
  FrontSurface=fsARCoating
  GRef=1000
  TRef=25.0
  PNom=740.0
  PNomTolLow=0.00
  PNomTolUp=3.00
  BifacialityFactor=0.811
  Isc=18.660
  Voc=50.30
  Imp=17.580
  Vmp=42.10
  muISC=7.46
  muVocSpec=-114.0
  muPmpReq=-0.290
  RShunt=190
  Rp_0=800000
  Rp_Exp=10.00
  RSerie=0.148
  Gamma=1.079
  muGamma=-0.0005
  VMaxIEC=1500
  VMaxUL=1500
  Absorb=0.90
  ARev=3.200
  BRev=21.960
  RDiode=0.010
  VRevDiode=-0.70
  AirMassRef=1.500
  SandiaAMCorr=50.000
  RelEffic800=0.68
  RelEffic600=1.13
  RelEffic400=0.92
  RelEffic200=-0.68

  PVObject_IAM=pvIAM
    Flags=$00
    IAMMode=UserProfile
    IAMProfile=TCubicProfile
      NPtsMax=9
      NPtsEff=9
      LastCompile=$B18D
      Mode=3
      Point_1=0.0,1.00000
      Point_2=50.0,1.00000
      Point_3=60.0,1.00000
      Point_4=65.0,0.99800
      Point_5=70.0,0.99000
      Point_6=75.0,0.97500
      Point_7=80.0,0.93200
      Point_8=85.0,0.74900
      Point_9=90.0,0.00000
    End of TCubicProfile
  End of PVObject pvIAM

  OperPoints, list of=5 tOperPoint
    Point_1=True,1000,25.0,0.00,48.60,18.320,17.290,40.50,700.25
    Point_2=False,800,25.0,0.68,0.00,0.000,0.000,0.00,564.01
    Point_3=False,600,25.0,1.13,0.00,0.000,0.000,0.00,424.90
    Point_4=False,400,25.0,0.92,0.00,0.000,0.000,0.00,282.68
    Point_5=False,200,25.0,-0.68,0.00,0.000,0.000,0.00,139.10
  End of List OperPoints
End of PVObject pvModule
