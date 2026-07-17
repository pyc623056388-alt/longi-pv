PVObject_=pvModule
  Version=7.2.4
  Flags=$00900043

  PVObject_Commercial=pvCommercial
    Comment=http//en.longi-solar.com   (China)
    Flags=$0041
    Manufacturer=LONGi solar
    Model=LR7-54HVD-480M
    DataSource=TüV SüD
    YearBeg=2025
    Width=1.134
    Height=1.800
    Depth=0.030
    Weight=23.500
    NPieces=100
    PriceDate=19/06/24 13:10
    Remarks, Count=4
      Str_1=Aluminum
      Str_2=Heat strengthened glass
      Str_3=Doubleglass, Jbox IP 68, MC4 or mateable
      Str_4=N type, Bifacial,Half cut
    End of Remarks=N type, Bifacial,Half cut
  End of PVObject pvCommercial

  Technol=mtSiMono
  NCelS=54
  NCelP=2
  NDiode=3
  SubModuleLayout=slTwinHalfCells
  FrontSurface=fsARCoating
  GRef=1000
  TRef=25.0
  PNom=480.0
  PNomTolLow=0.00
  PNomTolUp=3.00
  BifacialityFactor=0.700
  Isc=14.980
  Voc=40.53
  Imp=14.330
  Vmp=33.51
  muISC=7.19
  muVocSpec=-81.7
  muPmpReq=-0.258
  RShunt=350
  Rp_0=5000
  Rp_Exp=5.50
  RSerie=0.152
  Gamma=1.061
  muGamma=-0.0002
  VMaxIEC=1500
  VMaxUL=1500
  Absorb=0.90
  ARev=3.200
  BRev=18.144
  RDiode=0.010
  VRevDiode=-0.70
  AirMassRef=1.500
  CellArea=174.9
  SandiaAMCorr=50.000
  RelEffic800=0.36
  RelEffic600=0.44
  RelEffic400=0.17
  RelEffic200=-1.58

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
      Point_5=70.0,0.96000
      Point_6=75.0,0.91000
      Point_7=80.0,0.84100
      Point_8=85.0,0.67000
      Point_9=90.0,0.00000
    End of TCubicProfile
  End of PVObject pvIAM

  OperPoints, list of=6 tOperPoint
    Point_1=False,200,25.0,-1.58,0.00,0.000,0.000,0.00
    Point_2=False,400,25.0,0.17,0.00,0.000,0.000,0.00
    Point_3=False,600,25.0,0.44,0.00,0.000,0.000,0.00
    Point_4=False,800,25.0,0.36,0.00,0.000,0.000,0.00
    Point_5=False,1000,25.0,0.00,0.00,0.000,0.000,0.00
    Point_6=False,1100,25.0,-0.04,0.00,0.000,0.000,0.00
  End of List OperPoints
End of PVObject pvModule
