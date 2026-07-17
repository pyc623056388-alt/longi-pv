PVObject_=pvModule
  Version=7.2.3
  Flags=$00900043

  PVObject_Commercial=pvCommercial
    Comment=www.jinkosolar.com(china)
    Flags=$0041
    Manufacturer=Jinkosolar 2024
    Model=JKM720N-66HL5-BDV
    DataSource=Manufacturer 2024 SGS-CSTC
    YearBeg=2024
    Width=1.303
    Height=2.384
    Depth=0.033
    Weight=37.500
    NPieces=100
    PriceDate=10/01/24 17:10
  End of PVObject pvCommercial

  Technol=mtSiMono
  NCelS=66
  NCelP=2
  NDiode=3
  SubModuleLayout=slTwinHalfCells
  GRef=1000
  TRef=25.0
  PNom=720.0
  PNomTolLow=0.00
  PNomTolUp=3.00
  BifacialityFactor=0.800
  Isc=18.670
  Voc=49.04
  Imp=17.610
  Vmp=40.89
  muISC=8.37
  muVocSpec=-137.8
  muPmpReq=-0.290
  RShunt=1000
  Rp_0=80000
  Rp_Exp=5.50
  RSerie=0.168
  Gamma=1.054
  muGamma=-0.0003
  VMaxIEC=1500
  VMaxUL=1500
  Absorb=0.90
  ARev=3.200
  BRev=12.170
  RDiode=0.010
  VRevDiode=-0.70
  AirMassRef=1.500
  CellArea=220.5
  LIDLoss=0.30
  SandiaAMCorr=50.000
  RelEffic800=0.53
  RelEffic600=0.80
  RelEffic400=0.51
  RelEffic200=-1.06

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
      Point_4=60.0,1.00000
      Point_5=70.0,0.98700
      Point_6=75.0,0.96900
      Point_7=80.0,0.92600
      Point_8=85.0,0.74100
      Point_9=90.0,0.00000
    End of TCubicProfile
  End of PVObject pvIAM

  OperPoints, list of=7 tOperPoint
    Point_1=False,1100,25.0,-0.32,0.00,0.000,0.000,0.00
    Point_2=False,1000,25.0,0.00,0.00,0.000,0.000,0.00
    Point_3=False,800,25.0,0.55,0.00,0.000,0.000,0.00
    Point_4=False,600,25.0,0.82,0.00,0.000,0.000,0.00
    Point_5=False,400,25.0,0.55,0.00,0.000,0.000,0.00
    Point_6=False,200,25.0,-1.00,0.00,0.000,0.000,0.00
    Point_7=False,100,25.0,-3.41,0.00,0.000,0.000,0.00
  End of List OperPoints
End of PVObject pvModule
