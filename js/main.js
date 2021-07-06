// https://jsfiddle.net/s2j985km/4/

const LineWidth = 16;
const LineHeight = 20;
const WindowColor = "#555";
const WindowHiliteColor = "#888";
const WindowBorderColor = "#888";

var GlobalWindowIdCounter = 0;
var GlobalWindowZIndexCounter = 0;
var GlobalColors = [];

GlobalColors.push({ Red: 0, Green: 0, Blue: 0 });
GlobalColors.push({ Red: 255, Green: 255, Blue: 255 });

var DevicePixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;

var UploadInput = document.getElementById("upload_input");

UploadInput.onchange = function (Event) {
  for (var Index = 0; Index < Event.target.files.length; Index++) {
    var ImageFileReader = new FileReader();

    let File = Event.target.files[Index];

    ImageFileReader.onload = function (FileReaderEvent) {
      if (
        File.type == "image/png" ||
        File.type == "image/jpeg" ||
        File.type == "image/gif"
      )
        LoadStandardImage(FileReaderEvent.target.result, File.name);
      else LoadOtherImage(FileReaderEvent.target.result, File.name);
    };

    ImageFileReader.readAsDataURL(Event.target.files[Index]);
  }
};

var Dropzone = document.getElementById("dropzone");

Dropzone.style.width = "100%";
Dropzone.style.height = "100%";

Dropzone.ondragover = function (Event) {
  Event.preventDefault();
};

Dropzone.ondragleave = function (Event) {
  Event.preventDefault();
};

Dropzone.ondrop = function (Event) {
  Event.preventDefault();

  if (
    Event.dataTransfer.types[0] == "Text" ||
    Event.dataTransfer.types[0] == "text/plain" ||
    Event.dataTransfer.types[0] == "public.utf8-plain-text"
  ) {
    var Data;

    if (Event.dataTransfer.types[0] == "Text")
      Data = Event.dataTransfer.getData("Text").split(",");
    else Data = Event.dataTransfer.getData("text/plain").split(",");

    document.getElementById(Data[2]).style.left =
      document.getElementById(Data[2]).offsetLeft +
      Event.screenX -
      parseInt(Data[0], 10);
    document.getElementById(Data[2]).style.top =
      document.getElementById(Data[2]).offsetTop +
      Event.screenY -
      parseInt(Data[1], 10);
  }

  for (var Index = 0; Index < Event.dataTransfer.files.length; Index++) {
    var ImageFileReader = new FileReader();

    let File = Event.dataTransfer.files[Index];

    ImageFileReader.onload = function (FileReaderEvent) {
      if (
        File.type == "image/png" ||
        File.type == "image/jpeg" ||
        File.type == "image/gif"
      )
        LoadStandardImage(FileReaderEvent.target.result, File.name);
      else LoadOtherImage(FileReaderEvent.target.result, File.name);
    };

    ImageFileReader.readAsDataURL(Event.dataTransfer.files[Index]);
  }
};

LoadStandardImage("sw.png", "sw.png");

// -----------------------------------------------------------------------------

function LoadStandardImage(ImageSource, FileName) {
  var ImageInfos = [];

  ImageInfos.Image = document.createElement("img");
  ImageInfos.FileName = FileName;
  ImageInfos.Image.onload = function () {
    DisplayImageWindow(ImageInfos);
  };
  ImageInfos.Image.src = ImageSource;
}

function LoadOtherImage(ImageSource, FileName) {
  var ImageInfos = [];

  ImageInfos.Image = document.createElement("img");
  ImageInfos.FileName = FileName;
  ImageInfos.Data = new Uint8Array(Base64ToArray(ImageSource));

  DecodeIff(ImageInfos);

  if (ImageInfos.Canvas) {
    ImageInfos.Image.onload = function () {
      DisplayImageWindow(ImageInfos);
    };
    ImageInfos.Image.src = ImageInfos.Canvas.toDataURL();
  }
}

function Base64ToArray(Base64Data) {
  var Base64TranslationTable = [
    62, 0, 0, 0, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 0, 0, 0, 0, 0, 0,
    0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 0, 0, 0, 0, 0, 0, 26, 27, 28, 29, 30, 31, 32, 33, 34,
    35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
  ];

  var DecodedData = [];

  for (
    var Index = Base64Data.lastIndexOf(",") + 1;
    Index < Base64Data.length;
    Index += 4
  ) {
    var DecodedTriplet =
      (Base64TranslationTable[Base64Data.charCodeAt(Index) - 43] << 18) |
      (Base64TranslationTable[Base64Data.charCodeAt(Index + 1) - 43] << 12) |
      (Base64TranslationTable[Base64Data.charCodeAt(Index + 2) - 43] << 6) |
      Base64TranslationTable[Base64Data.charCodeAt(Index + 3) - 43];

    for (var TripletIndex = 0; TripletIndex < 3; TripletIndex++) {
      if (Base64Data[Index + TripletIndex] != "=") {
        DecodedData.push((DecodedTriplet >> (16 - TripletIndex * 8)) & 0xff);
      } else {
        break;
      }
    }
  }

  return DecodedData;
}

function DecodeIff(ImageInfos) {
  var IffInfos = {
    Data: ImageInfos.Data,
    DataIndex: 0,
    Colors: null,
    Canvas: null,
  };

  ParseIff(IffInfos);

  ImageInfos.Canvas = IffInfos.Canvas;
  ImageInfos.Colors = IffInfos.Colors;
  ImageInfos.AspectX = IffInfos.AspectX;
  ImageInfos.AspectY = IffInfos.AspectY;
}

function ParseIff(IffInfos) {
  var Id = String.fromCharCode(IffInfos.Data[IffInfos.DataIndex++]);
  Id += String.fromCharCode(IffInfos.Data[IffInfos.DataIndex++]);
  Id += String.fromCharCode(IffInfos.Data[IffInfos.DataIndex++]);
  Id += String.fromCharCode(IffInfos.Data[IffInfos.DataIndex++]);

  var Size = IffInfos.Data[IffInfos.DataIndex++] << 24;
  Size += IffInfos.Data[IffInfos.DataIndex++] << 16;
  Size += IffInfos.Data[IffInfos.DataIndex++] << 8;
  Size += IffInfos.Data[IffInfos.DataIndex++];

  if (IffInfos.DataIndex == 8 && Id != "FORM") {
    console.log("Image is not an ILBM file!");

    return;
  }

  var EndIndex = IffInfos.DataIndex + Size;

  while (IffInfos.DataIndex < EndIndex) {
    switch (Id) {
      case "FORM":
        var Type = String.fromCharCode(IffInfos.Data[IffInfos.DataIndex++]);
        Type += String.fromCharCode(IffInfos.Data[IffInfos.DataIndex++]);
        Type += String.fromCharCode(IffInfos.Data[IffInfos.DataIndex++]);
        Type += String.fromCharCode(IffInfos.Data[IffInfos.DataIndex++]);

        if (Type != "ILBM") {
          IffInfos.DataIndex += Size;

          return;
        }

        while (IffInfos.DataIndex < EndIndex) ParseIff(IffInfos);

        break;

      case "BMHD":
        IffInfos.Width = IffInfos.Data[IffInfos.DataIndex++] << 8;
        IffInfos.Width += IffInfos.Data[IffInfos.DataIndex++];

        IffInfos.Height = IffInfos.Data[IffInfos.DataIndex++] << 8;
        IffInfos.Height += IffInfos.Data[IffInfos.DataIndex++];

        IffInfos.OffsetX = IffInfos.Data[IffInfos.DataIndex++] << 8;
        IffInfos.OffsetX += IffInfos.Data[IffInfos.DataIndex++];

        IffInfos.OffsetY = IffInfos.Data[IffInfos.DataIndex++] << 8;
        IffInfos.OffsetY += IffInfos.Data[IffInfos.DataIndex++];

        IffInfos.Bitplanes = IffInfos.Data[IffInfos.DataIndex++];
        IffInfos.Masking = IffInfos.Data[IffInfos.DataIndex++];
        IffInfos.Compression = IffInfos.Data[IffInfos.DataIndex++];

        IffInfos.DataIndex++;

        IffInfos.TransparentColor = IffInfos.Data[IffInfos.DataIndex++] << 8;
        IffInfos.TransparentColor += IffInfos.Data[IffInfos.DataIndex++];

        IffInfos.AspectX = IffInfos.Data[IffInfos.DataIndex++];
        IffInfos.AspectY = IffInfos.Data[IffInfos.DataIndex++];

        IffInfos.PageWidth = IffInfos.Data[IffInfos.DataIndex++] << 8;
        IffInfos.PageWidth += IffInfos.Data[IffInfos.DataIndex++];

        IffInfos.PageHeight = IffInfos.Data[IffInfos.DataIndex++] << 8;
        IffInfos.PageHeight += IffInfos.Data[IffInfos.DataIndex++];

        break;

      case "CAMG":
        if (Size == 4) {
          IffInfos.ViewportMode = IffInfos.Data[IffInfos.DataIndex++] << 24;
          IffInfos.ViewportMode += IffInfos.Data[IffInfos.DataIndex++] << 16;
          IffInfos.ViewportMode += IffInfos.Data[IffInfos.DataIndex++] << 8;
          IffInfos.ViewportMode += IffInfos.Data[IffInfos.DataIndex++];
        } else {
          console.log("Unknown CAMG chunk size detected!");

          IffInfos.DataIndex += Size;
        }

        break;

      case "PCHG":
        IffInfos.PchgCompression = IffInfos.Data[IffInfos.DataIndex++] << 8;
        IffInfos.PchgCompression += IffInfos.Data[IffInfos.DataIndex++];

        IffInfos.PchgFlags = IffInfos.Data[IffInfos.DataIndex++] << 8;
        IffInfos.PchgFlags += IffInfos.Data[IffInfos.DataIndex++];

        IffInfos.PchgStartLine = IffInfos.Data[IffInfos.DataIndex++] << 8;
        IffInfos.PchgStartLine += IffInfos.Data[IffInfos.DataIndex++];

        IffInfos.PchgLineCount = IffInfos.Data[IffInfos.DataIndex++] << 8;
        IffInfos.PchgLineCount += IffInfos.Data[IffInfos.DataIndex++];

        IffInfos.PchgChangedLines = IffInfos.Data[IffInfos.DataIndex++] << 8;
        IffInfos.PchgChangedLines += IffInfos.Data[IffInfos.DataIndex++];

        IffInfos.PchgMinReg = IffInfos.Data[IffInfos.DataIndex++] << 8;
        IffInfos.PchgMinReg += IffInfos.Data[IffInfos.DataIndex++];

        IffInfos.PchgMaxReg = IffInfos.Data[IffInfos.DataIndex++] << 8;
        IffInfos.PchgMaxReg += IffInfos.Data[IffInfos.DataIndex++];

        IffInfos.PchgMaxChanges = IffInfos.Data[IffInfos.DataIndex++] << 8;
        IffInfos.PchgMaxChanges += IffInfos.Data[IffInfos.DataIndex++];

        IffInfos.PchgTotalChanges = IffInfos.Data[IffInfos.DataIndex++] << 24;
        IffInfos.PchgTotalChanges += IffInfos.Data[IffInfos.DataIndex++] << 16;
        IffInfos.PchgTotalChanges += IffInfos.Data[IffInfos.DataIndex++] << 8;
        IffInfos.PchgTotalChanges += IffInfos.Data[IffInfos.DataIndex++];

        if (IffInfos.PchgCompression) {
          console.log("PCHG compression not supported!");

          IffInfos.DataIndex += Size - 20;

          break;
        }

        IffInfos.PchgMaskDataIndex = IffInfos.DataIndex;

        IffInfos.DataIndex +=
          Math.floor((IffInfos.PchgLineCount + 31) / 32) * 4;

        IffInfos.PchgPalettes = [];

        var LineCounter = 0;

        var PreviousLineColors = [];

        for (
          var ColorIndex = 0;
          ColorIndex < IffInfos.Colors.length;
          ColorIndex++
        )
          PreviousLineColors.push({
            Red: IffInfos.Colors[ColorIndex].Red,
            Green: IffInfos.Colors[ColorIndex].Green,
            Blue: IffInfos.Colors[ColorIndex].Blue,
          });

        for (var LineIndex = 0; LineIndex < IffInfos.Height; LineIndex++) {
          if (LineIndex < IffInfos.PchgStartLine) {
            IffInfos.PchgPalettes.push(IffInfos.Colors);

            continue;
          }

          var LineColors = [];

          for (
            var ColorIndex = 0;
            ColorIndex < IffInfos.Colors.length;
            ColorIndex++
          )
            LineColors.push({
              Red: PreviousLineColors[ColorIndex].Red,
              Green: PreviousLineColors[ColorIndex].Green,
              Blue: PreviousLineColors[ColorIndex].Blue,
            });

          var ByteIndex = LineCounter >> 3;
          var BitMask = 0x80 >> (LineCounter & 0x7);

          if (IffInfos.Data[IffInfos.PchgMaskDataIndex + ByteIndex] & BitMask) {
            var ChangeCount16 = IffInfos.Data[IffInfos.DataIndex++];
            var ChangeCount32 = IffInfos.Data[IffInfos.DataIndex++];

            for (
              var ChangeCountIndex = 0;
              ChangeCountIndex < ChangeCount16;
              ChangeCountIndex++
            ) {
              var ChangeData = IffInfos.Data[IffInfos.DataIndex++] << 8;

              ChangeData += IffInfos.Data[IffInfos.DataIndex++];

              var ColorIndex = ChangeData >> 12;

              PreviousLineColors[ColorIndex].Red = LineColors[ColorIndex].Red =
                ((ChangeData >> 8) & 0xf) * 17;
              PreviousLineColors[ColorIndex].Green = LineColors[
                ColorIndex
              ].Green = ((ChangeData >> 4) & 0xf) * 17;
              PreviousLineColors[ColorIndex].Blue = LineColors[
                ColorIndex
              ].Blue = (ChangeData & 0xf) * 17;
            }

            for (
              var ChangeCountIndex = 0;
              ChangeCountIndex < ChangeCount32;
              ChangeCountIndex++
            ) {}
          }

          IffInfos.PchgPalettes.push(LineColors);

          LineCounter++;
        }

        break;

      case "CMAP":
        IffInfos.Colors = [];

        var LowerColorBits = 0;

        while (IffInfos.DataIndex < EndIndex) {
          var Red = IffInfos.Data[IffInfos.DataIndex++];
          var Green = IffInfos.Data[IffInfos.DataIndex++];
          var Blue = IffInfos.Data[IffInfos.DataIndex++];

          IffInfos.Colors.push({ Red: Red, Green: Green, Blue: Blue });

          LowerColorBits |= (Red & 0x0f) | (Green & 0x0f) | (Blue & 0x0f);
        }

        if (LowerColorBits == 0) {
          // Check for a 4096 colors palette.
          for (
            var ColorIndex = 0;
            ColorIndex < IffInfos.Colors.length;
            ColorIndex++
          ) {
            var ShadesScale = (240 - 1) / 255;
            var InverseShadesScale = 1 / ShadesScale;

            IffInfos.Colors[ColorIndex].Red = Math.round(
              Math.round(IffInfos.Colors[ColorIndex].Red * ShadesScale) *
                InverseShadesScale
            );
            IffInfos.Colors[ColorIndex].Green = Math.round(
              Math.round(IffInfos.Colors[ColorIndex].Green * ShadesScale) *
                InverseShadesScale
            );
            IffInfos.Colors[ColorIndex].Blue = Math.round(
              Math.round(IffInfos.Colors[ColorIndex].Blue * ShadesScale) *
                InverseShadesScale
            );
          }
        }

        if (IffInfos.DataIndex & 1)
          // Avoid odd data index.
          IffInfos.DataIndex++;

        break;

      case "BODY":
        if (IffInfos.Canvas) {
          console.log("Found another BODY - skipping...");

          IffInfos.DataIndex += Size;

          break;
        }

        if (IffInfos.ViewportMode & 0x80) {
          // EHB image.
          while (IffInfos.Colors.length < 64)
            IffInfos.Colors.push({ Red: 0, Green: 0, Blue: 0 });

          for (var Index = 0; Index < 32; Index++) {
            var Red = Math.floor(IffInfos.Colors[Index].Red / 2.0);
            var Green = Math.floor(IffInfos.Colors[Index].Green / 2.0);
            var Blue = Math.floor(IffInfos.Colors[Index].Blue / 2.0);

            IffInfos.Colors[Index + 32].Red = Red;
            IffInfos.Colors[Index + 32].Green = Green;
            IffInfos.Colors[Index + 32].Blue = Blue;
          }
        }

        IffInfos.Canvas = document.createElement("canvas");

        IffInfos.Canvas.width = IffInfos.Width;
        IffInfos.Canvas.height = IffInfos.Height;

        var Context = IffInfos.Canvas.getContext("2d");
        var Data = Context.getImageData(0, 0, IffInfos.Width, IffInfos.Height);

        var LineByteCount = Math.ceil(IffInfos.Width / 16) * 2;

        var Bitplanes = [IffInfos.Bitplanes];

        for (var Index = 0; Index < IffInfos.Bitplanes; Index++)
          Bitplanes[Index] = [LineByteCount];

        for (var Y = 0; Y < IffInfos.Height; Y++) {
          for (
            var BitplaneIndex = 0;
            BitplaneIndex < IffInfos.Bitplanes;
            BitplaneIndex++
          ) {
            if (IffInfos.Compression == 1) {
              var LineByteIndex = 0;

              while (LineByteIndex < LineByteCount) {
                var Count = IffInfos.Data[IffInfos.DataIndex++];

                if (Count < 128) {
                  Count++;

                  while (Count--)
                    Bitplanes[BitplaneIndex][LineByteIndex++] =
                      IffInfos.Data[IffInfos.DataIndex++];
                } else {
                  Count = 256 - Count + 1;
                  var Byte = IffInfos.Data[IffInfos.DataIndex++];

                  while (Count--)
                    Bitplanes[BitplaneIndex][LineByteIndex++] = Byte;
                }
              }
            } else {
              for (
                var LineByteIndex = 0;
                LineByteIndex < LineByteCount;
                LineByteIndex++
              ) {
                Bitplanes[BitplaneIndex][LineByteIndex] =
                  IffInfos.Data[IffInfos.DataIndex++];
              }
            }
          }

          var LastColor = { Red: 0, Green: 0, Blue: 0 };

          var LineColors = IffInfos.Colors;

          if (IffInfos.PchgPalettes) LineColors = IffInfos.PchgPalettes[Y];

          for (var X = 0; X < IffInfos.Width; X++) {
            var LineByteIndex = Math.floor(X / 8.0);
            var ByteMask = 0x80 >> (X & 0x7);
            var ColorIndex = 0;

            for (
              var BitplaneIndex = 0;
              BitplaneIndex < IffInfos.Bitplanes;
              BitplaneIndex++
            )
              if ((Bitplanes[BitplaneIndex][LineByteIndex] & ByteMask) != 0)
                ColorIndex += 1 << BitplaneIndex;

            var PixelIndex = (X + Y * IffInfos.Width) * 4;

            if (IffInfos.ViewportMode & 0x800) {
              // HAM image.
              if (ColorIndex < LineColors.length) {
                LastColor.Red = LineColors[ColorIndex].Red;
                LastColor.Green = LineColors[ColorIndex].Green;
                LastColor.Blue = LineColors[ColorIndex].Blue;
              } else {
                var HamCode = ColorIndex >> (IffInfos.Bitplanes - 2);
                var Component =
                  ((ColorIndex & ((1 << (IffInfos.Bitplanes - 2)) - 1)) * 255) /
                  ((1 << (IffInfos.Bitplanes - 2)) - 1);

                switch (HamCode) {
                  case 2:
                    LastColor.Red = Component;

                    break;

                  case 3:
                    LastColor.Green = Component;

                    break;

                  case 1:
                    LastColor.Blue = Component;

                    break;
                }
              }

              Data.data[PixelIndex] = LastColor.Red;
              Data.data[PixelIndex + 1] = LastColor.Green;
              Data.data[PixelIndex + 2] = LastColor.Blue;
              Data.data[PixelIndex + 3] = 255;
            } else {
              if (ColorIndex >= LineColors.length) ColorIndex = 0;

              Data.data[PixelIndex] = LineColors[ColorIndex].Red;
              Data.data[PixelIndex + 1] = LineColors[ColorIndex].Green;
              Data.data[PixelIndex + 2] = LineColors[ColorIndex].Blue;
              Data.data[PixelIndex + 3] = 255;
            }
          }
        }

        Context.putImageData(Data, 0, 0);

        break;

      default:
        IffInfos.DataIndex += Size;

        if (IffInfos.DataIndex & 1)
          // Avoid odd data index.
          IffInfos.DataIndex++;

        break;
    }
  }
}

function DisplayImageWindow(ImageInfos) {
  ImageInfos.Id = GlobalWindowIdCounter++;

  Dropzone.appendChild(CreateImageWindow(ImageInfos));

  ProcessMenuAction(ImageInfos.Id);
}

function GetColors(Canvas) {
  var Context = Canvas.getContext("2d");
  var Data = Context.getImageData(0, 0, Canvas.width, Canvas.height);
  var ColorCube = new Uint32Array(256 * 256 * 256);
  var Colors = [];

  for (var Y = 0; Y < Canvas.height; Y++) {
    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * Canvas.width) * 4;

      var Red = Data.data[PixelIndex];
      var Green = Data.data[PixelIndex + 1];
      var Blue = Data.data[PixelIndex + 2];
      var Alpha = Data.data[PixelIndex + 3];

      if (Alpha == 255) {
        if (ColorCube[Red * 256 * 256 + Green * 256 + Blue] == 0)
          Colors.push({ Red: Red, Green: Green, Blue: Blue });

        ColorCube[Red * 256 * 256 + Green * 256 + Blue]++;
      }
    }
  }

  Colors.sort(function (Color1, Color2) {
    return (
      SrgbToRgb(Color1.Red) * 0.21 +
      SrgbToRgb(Color1.Green) * 0.72 +
      SrgbToRgb(Color1.Blue) * 0.07 -
      (SrgbToRgb(Color2.Red) * 0.21 +
        SrgbToRgb(Color2.Green) * 0.72 +
        SrgbToRgb(Color2.Blue) * 0.07)
    );
  });

  return Colors;
}

function TrimColorCube(ColorCube, ColorCubeInfo) {
  var RedMin = 255;
  var RedMax = 0;

  var GreenMin = 255;
  var GreenMax = 0;

  var BlueMin = 255;
  var BlueMax = 0;

  var RedCounts = new Uint32Array(256);
  var GreenCounts = new Uint32Array(256);
  var BlueCounts = new Uint32Array(256);

  var TotalColorCount = 0;

  var AverageRed = 0;
  var AverageGreen = 0;
  var AverageBlue = 0;

  for (var Red = ColorCubeInfo.RedMin; Red <= ColorCubeInfo.RedMax; Red++) {
    for (
      var Green = ColorCubeInfo.GreenMin;
      Green <= ColorCubeInfo.GreenMax;
      Green++
    ) {
      for (
        var Blue = ColorCubeInfo.BlueMin;
        Blue <= ColorCubeInfo.BlueMax;
        Blue++
      ) {
        var ColorCount = ColorCube[Red * 256 * 256 + Green * 256 + Blue];

        if (ColorCount != 0) {
          RedCounts[Red] += ColorCount;
          GreenCounts[Green] += ColorCount;
          BlueCounts[Blue] += ColorCount;

          if (Red < RedMin) RedMin = Red;

          if (Red > RedMax) RedMax = Red;

          if (Green < GreenMin) GreenMin = Green;

          if (Green > GreenMax) GreenMax = Green;

          if (Blue < BlueMin) BlueMin = Blue;

          if (Blue > BlueMax) BlueMax = Blue;

          AverageRed += Red * ColorCount;
          AverageGreen += Green * ColorCount;
          AverageBlue += Blue * ColorCount;

          TotalColorCount += ColorCount;
        }
      }
    }
  }

  AverageRed = Math.round(AverageRed / TotalColorCount);
  AverageGreen = Math.round(AverageGreen / TotalColorCount);
  AverageBlue = Math.round(AverageBlue / TotalColorCount);

  return {
    RedMin: RedMin,
    RedMax: RedMax,
    GreenMin: GreenMin,
    GreenMax: GreenMax,
    BlueMin: BlueMin,
    BlueMax: BlueMax,
    RedCounts: RedCounts,
    GreenCounts: GreenCounts,
    BlueCounts: BlueCounts,
    Red: AverageRed,
    Green: AverageGreen,
    Blue: AverageBlue,
    ColorCount: TotalColorCount,
  };
}

function RgbToSrgb(ColorChannel) {
  return Math.pow(ColorChannel / 255, 1 / 2.2) * 255;
}

function SrgbToRgb(ColorChannel) {
  return Math.pow(ColorChannel / 255, 2.2) * 255;
}

function RemapImage(Canvas, Colors, DitherPattern) {
  var Context = Canvas.getContext("2d");
  var Data = Context.getImageData(0, 0, Canvas.width, Canvas.height);

  var MixedColors = [];

  for (var Index = 0; Index < Colors.length; Index++)
    MixedColors.push({
      Red: Colors[Index].Red,
      Green: Colors[Index].Green,
      Blue: Colors[Index].Blue,
      TrueRed: SrgbToRgb(Colors[Index].Red),
      TrueGreen: SrgbToRgb(Colors[Index].Green),
      TrueBlue: SrgbToRgb(Colors[Index].Blue),
    });

  if (DitherPattern && DitherPattern[0] > 0 && Colors.length <= 64) {
    for (var Index1 = 0; Index1 < Colors.length; Index1++) {
      for (var Index2 = Index1 + 1; Index2 < Colors.length; Index2++) {
        var Luminance1 =
          SrgbToRgb(Colors[Index1].Red) * 0.21 +
          SrgbToRgb(Colors[Index1].Green) * 0.72 +
          SrgbToRgb(Colors[Index1].Blue) * 0.07;
        var Luminance2 =
          SrgbToRgb(Colors[Index2].Red) * 0.21 +
          SrgbToRgb(Colors[Index2].Green) * 0.72 +
          SrgbToRgb(Colors[Index2].Blue) * 0.07;
        var LuminanceDeltaSquare =
          (Luminance1 - Luminance2) * (Luminance1 - Luminance2);

        if (LuminanceDeltaSquare < DitherPattern[0] * DitherPattern[0]) {
          var Red = RgbToSrgb(
            (SrgbToRgb(Colors[Index1].Red) + SrgbToRgb(Colors[Index2].Red)) /
              2.0
          );
          var Green = RgbToSrgb(
            (SrgbToRgb(Colors[Index1].Green) +
              SrgbToRgb(Colors[Index2].Green)) /
              2.0
          );
          var Blue = RgbToSrgb(
            (SrgbToRgb(Colors[Index1].Blue) + SrgbToRgb(Colors[Index2].Blue)) /
              2.0
          );

          MixedColors.push({
            Index1: Index1,
            Index2: Index2,
            Red: Red,
            Green: Green,
            Blue: Blue,
            TrueRed: SrgbToRgb(Red),
            TrueGreen: SrgbToRgb(Green),
            TrueBlue: SrgbToRgb(Blue),
          });
        }
      }
    }
  }

  Colors = MixedColors;

  for (var Y = 0; Y < Canvas.height; Y++) {
    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * Canvas.width) * 4;
      var SrgbIndex = X + Y * Canvas.width;

      var Red = Data.data[PixelIndex];
      var Green = Data.data[PixelIndex + 1];
      var Blue = Data.data[PixelIndex + 2];
      var Alpha = Data.data[PixelIndex + 3];

      var TrueRed = SrgbToRgb(Red);
      var TrueGreen = SrgbToRgb(Green);
      var TrueBlue = SrgbToRgb(Blue);

      var Luminance = TrueRed * 0.21 + TrueGreen * 0.72 + TrueBlue * 0.07;

      if (Alpha == 255) {
        // Find the matching color index.

        var LastDistance = Number.MAX_VALUE;
        var RemappedColorIndex = 0;

        for (var ColorIndex = 0; ColorIndex < Colors.length; ColorIndex++) {
          var RedDelta = Colors[ColorIndex].TrueRed - TrueRed;
          var GreenDelta = Colors[ColorIndex].TrueGreen - TrueGreen;
          var BlueDelta = Colors[ColorIndex].TrueBlue - TrueBlue;
          var LuminanceDelta =
            Colors[ColorIndex].TrueRed * 0.21 +
            Colors[ColorIndex].TrueGreen * 0.72 +
            Colors[ColorIndex].TrueBlue * 0.07 -
            Luminance;

          var Distance = 0;

          if (Colors[ColorIndex].Index1 !== undefined) {
            var RedDelta1 = Colors[Colors[ColorIndex].Index1].TrueRed - TrueRed;
            var GreenDelta1 =
              Colors[Colors[ColorIndex].Index1].TrueGreen - TrueGreen;
            var BlueDelta1 =
              Colors[Colors[ColorIndex].Index1].TrueBlue - TrueBlue;

            var LuminanceDelta1 =
              Colors[Colors[ColorIndex].Index1].TrueRed * 0.21 +
              Colors[Colors[ColorIndex].Index1].TrueGreen * 0.72 +
              Colors[Colors[ColorIndex].Index1].TrueBlue * 0.07 -
              Luminance;

            var RedDelta2 = Colors[Colors[ColorIndex].Index2].TrueRed - TrueRed;
            var GreenDelta2 =
              Colors[Colors[ColorIndex].Index2].TrueGreen - TrueGreen;
            var BlueDelta2 =
              Colors[Colors[ColorIndex].Index2].TrueBlue - TrueBlue;

            var LuminanceDelta2 =
              Colors[Colors[ColorIndex].Index2].TrueRed * 0.21 +
              Colors[Colors[ColorIndex].Index2].TrueGreen * 0.72 +
              Colors[Colors[ColorIndex].Index2].TrueBlue * 0.07 -
              Luminance;

            Distance =
              ColorDistance(RedDelta, GreenDelta, BlueDelta, LuminanceDelta) *
              4;
            Distance += ColorDistance(
              RedDelta1,
              GreenDelta1,
              BlueDelta1,
              LuminanceDelta1
            );
            Distance += ColorDistance(
              RedDelta2,
              GreenDelta2,
              BlueDelta2,
              LuminanceDelta2
            );

            Distance /= 4 + 1 + 1;
          } else {
            Distance = ColorDistance(
              RedDelta,
              GreenDelta,
              BlueDelta,
              LuminanceDelta
            );
          }

          if (Distance < LastDistance) {
            RemappedColorIndex = ColorIndex;
            LastDistance = Distance;
          }
        }

        if (DitherPattern) {
          if (DitherPattern[0] > 0) {
            // Checker pattern.
            if (Colors[RemappedColorIndex].Index1 !== undefined) {
              if ((X ^ Y) & 1)
                RemappedColorIndex = Colors[RemappedColorIndex].Index1;
              else RemappedColorIndex = Colors[RemappedColorIndex].Index2;
            }

            Data.data[PixelIndex] = Colors[RemappedColorIndex].Red;
            Data.data[PixelIndex + 1] = Colors[RemappedColorIndex].Green;
            Data.data[PixelIndex + 2] = Colors[RemappedColorIndex].Blue;
            Data.data[PixelIndex + 3] = 255;
          } // Error diffusion.
          else {
            var RedDelta = Colors[RemappedColorIndex].Red - Red;
            var GreenDelta = Colors[RemappedColorIndex].Green - Green;
            var BlueDelta = Colors[RemappedColorIndex].Blue - Blue;

            if (X < Canvas.width - 2) {
              if (DitherPattern[4]) {
                Data.data[PixelIndex + 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 8] - RedDelta * DitherPattern[4]
                    )
                  )
                );
                Data.data[PixelIndex + 8 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 8 + 1] -
                        GreenDelta * DitherPattern[4]
                    )
                  )
                );
                Data.data[PixelIndex + 8 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 8 + 2] -
                        BlueDelta * DitherPattern[4]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 1 && DitherPattern[9]) {
                Data.data[PixelIndex + Canvas.width * 4 + 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 8] -
                        RedDelta * DitherPattern[9]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 8 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 8 + 1] -
                        GreenDelta * DitherPattern[9]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 8 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 8 + 2] -
                        BlueDelta * DitherPattern[9]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[14]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 + 8] -
                        RedDelta * DitherPattern[14]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 1] -
                          GreenDelta * DitherPattern[14]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 2] -
                          BlueDelta * DitherPattern[14]
                      )
                    )
                  );
              }
            }

            if (X < Canvas.width - 1) {
              if (DitherPattern[3]) {
                Data.data[PixelIndex + 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 4] - RedDelta * DitherPattern[3]
                    )
                  )
                );
                Data.data[PixelIndex + 4 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 4 + 1] -
                        GreenDelta * DitherPattern[3]
                    )
                  )
                );
                Data.data[PixelIndex + 4 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 4 + 2] -
                        BlueDelta * DitherPattern[3]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 1 && DitherPattern[8]) {
                Data.data[PixelIndex + Canvas.width * 4 + 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 4] -
                        RedDelta * DitherPattern[8]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 4 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 4 + 1] -
                        GreenDelta * DitherPattern[8]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 4 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 4 + 2] -
                        BlueDelta * DitherPattern[8]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[13]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 + 4] -
                        RedDelta * DitherPattern[13]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 1] -
                          GreenDelta * DitherPattern[13]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 2] -
                          BlueDelta * DitherPattern[13]
                      )
                    )
                  );
              }
            }

            if (Y < Canvas.height - 1 && DitherPattern[7]) {
              Data.data[PixelIndex + Canvas.width * 4] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 4] -
                      RedDelta * DitherPattern[7]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 4 + 1] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 4 + 1] -
                      GreenDelta * DitherPattern[7]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 4 + 2] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 4 + 2] -
                      BlueDelta * DitherPattern[7]
                  )
                )
              );
            }

            if (Y < Canvas.height - 2 && DitherPattern[12]) {
              Data.data[PixelIndex + Canvas.width * 2 * 4] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 2 * 4] -
                      RedDelta * DitherPattern[12]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 2 * 4 + 1] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 2 * 4 + 1] -
                      GreenDelta * DitherPattern[12]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 2 * 4 + 2] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 2 * 4 + 2] -
                      BlueDelta * DitherPattern[12]
                  )
                )
              );
            }

            if (X > 0) {
              if (Y < Canvas.height - 1 && DitherPattern[6]) {
                Data.data[PixelIndex + Canvas.width * 4 - 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 4] -
                        RedDelta * DitherPattern[6]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 4 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 4 + 1] -
                        GreenDelta * DitherPattern[6]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 4 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 4 + 2] -
                        BlueDelta * DitherPattern[6]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[11]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 - 4] -
                        RedDelta * DitherPattern[11]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 1] -
                          GreenDelta * DitherPattern[11]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 2] -
                          BlueDelta * DitherPattern[11]
                      )
                    )
                  );
              }
            }

            if (X > 1) {
              if (Y < Canvas.height - 1 && DitherPattern[5]) {
                Data.data[PixelIndex + Canvas.width * 4 - 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 8] -
                        RedDelta * DitherPattern[5]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 8 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 8 + 1] -
                        GreenDelta * DitherPattern[5]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 8 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 8 + 2] -
                        BlueDelta * DitherPattern[5]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[10]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 - 8] -
                        RedDelta * DitherPattern[10]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 1] -
                          GreenDelta * DitherPattern[10]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 2] -
                          BlueDelta * DitherPattern[10]
                      )
                    )
                  );
              }
            }

            Data.data[PixelIndex] = Colors[RemappedColorIndex].Red;
            Data.data[PixelIndex + 1] = Colors[RemappedColorIndex].Green;
            Data.data[PixelIndex + 2] = Colors[RemappedColorIndex].Blue;
            Data.data[PixelIndex + 3] = 255;
          }
        } else {
          Data.data[PixelIndex] = Colors[RemappedColorIndex].Red;
          Data.data[PixelIndex + 1] = Colors[RemappedColorIndex].Green;
          Data.data[PixelIndex + 2] = Colors[RemappedColorIndex].Blue;
          Data.data[PixelIndex + 3] = 255;
        }
      }
    }
  }

  Context.putImageData(Data, 0, 0);
}

function RemapZxSpectrumImage1(Canvas, Colors, DitherPattern) {
  var Context = Canvas.getContext("2d");
  var Data = Context.getImageData(0, 0, Canvas.width, Canvas.height);

  var CanvasList = [];
  var ColorsMatrix = [
    Math.ceil(Canvas.width / 8) * Math.ceil(Canvas.height / 8),
  ];

  // Create a valid colors list.

  for (var Index1 = 0; Index1 < 8 - 1; Index1++) {
    for (var Index2 = Index1 + 1; Index2 < 8; Index2++) {
      // First color block entry.

      var NewCanvas = document.createElement("canvas");

      NewCanvas.width = Canvas.width;
      NewCanvas.height = Canvas.height;

      NewCanvas.getContext("2d").drawImage(Canvas, 0, 0);

      RemapImageLuminance(
        NewCanvas,
        [
          {
            Red: Colors[Index1].Red,
            Green: Colors[Index1].Green,
            Blue: Colors[Index1].Blue,
          },
          {
            Red: Colors[Index2].Red,
            Green: Colors[Index2].Green,
            Blue: Colors[Index2].Blue,
          },
        ],
        DitherPattern
      );

      CanvasList.push({
        Canvas: NewCanvas,
        Colors: [
          {
            Red: Colors[Index1].Red,
            Green: Colors[Index1].Green,
            Blue: Colors[Index1].Blue,
          },
          {
            Red: Colors[Index2].Red,
            Green: Colors[Index2].Green,
            Blue: Colors[Index2].Blue,
          },
        ],
      });

      // Second color block entry.

      NewCanvas = document.createElement("canvas");

      NewCanvas.width = Canvas.width;
      NewCanvas.height = Canvas.height;

      NewCanvas.getContext("2d").drawImage(Canvas, 0, 0);

      RemapImageLuminance(
        NewCanvas,
        [
          {
            Red: Colors[Index1 + 8].Red,
            Green: Colors[Index1 + 8].Green,
            Blue: Colors[Index1 + 8].Blue,
          },
          {
            Red: Colors[Index2 + 8].Red,
            Green: Colors[Index2 + 8].Green,
            Blue: Colors[Index2 + 8].Blue,
          },
        ],
        DitherPattern
      );

      CanvasList.push({
        Canvas: NewCanvas,
        Colors: [
          {
            Red: Colors[Index1 + 8].Red,
            Green: Colors[Index1 + 8].Green,
            Blue: Colors[Index1 + 8].Blue,
          },
          {
            Red: Colors[Index2 + 8].Red,
            Green: Colors[Index2 + 8].Green,
            Blue: Colors[Index2 + 8].Blue,
          },
        ],
      });
    }
  }

  // Create colors matrix.

  for (var Y = 0; Y < Math.ceil(Canvas.height / 8); Y++) {
    for (var X = 0; X < Math.ceil(Canvas.width / 8); X++) {
      var BestColorsListIndex = 0;
      var LastDistance = Number.MAX_VALUE;

      for (
        var ColorsListIndex = 0;
        ColorsListIndex < CanvasList.length;
        ColorsListIndex++
      ) {
        var TotalDistance = 0;

        for (var Y2 = 0; Y2 < 8; Y2++) {
          for (var X2 = 0; X2 < 8; X2++) {
            var PixelIndex = (X * 8 + X2 + (Y * 8 + Y2) * Canvas.width) * 4;

            var Red = Data.data[PixelIndex];
            var Green = Data.data[PixelIndex + 1];
            var Blue = Data.data[PixelIndex + 2];
            var Alpha = Data.data[PixelIndex + 3];
            var Luminance = Red * 0.21 + Green * 0.72 + Blue * 0.07;

            // First color.

            var RedDelta = CanvasList[ColorsListIndex].Colors[0].Red - Red;
            var GreenDelta =
              CanvasList[ColorsListIndex].Colors[0].Green - Green;
            var BlueDelta = CanvasList[ColorsListIndex].Colors[0].Blue - Blue;

            var Luminance2 =
              CanvasList[ColorsListIndex].Colors[0].Red * 0.21 +
              CanvasList[ColorsListIndex].Colors[0].Green * 0.72 +
              CanvasList[ColorsListIndex].Colors[0].Blue * 0.07;
            var LuminanceDelta = Luminance2 - Luminance;

            //var Distance = (RedDelta * RedDelta * 0.21 + GreenDelta * GreenDelta * 0.72 + BlueDelta * BlueDelta * 0.07) * 0.75 + LuminanceDelta * LuminanceDelta;
            var Distance =
              (RedDelta * RedDelta +
                GreenDelta * GreenDelta +
                BlueDelta * BlueDelta) *
                0.5 +
              LuminanceDelta * LuminanceDelta;

            // Second color.

            RedDelta = CanvasList[ColorsListIndex].Colors[1].Red - Red;
            GreenDelta = CanvasList[ColorsListIndex].Colors[1].Green - Green;
            BlueDelta = CanvasList[ColorsListIndex].Colors[1].Blue - Blue;

            Luminance2 =
              CanvasList[ColorsListIndex].Colors[1].Red * 0.21 +
              CanvasList[ColorsListIndex].Colors[1].Green * 0.72 +
              CanvasList[ColorsListIndex].Colors[1].Blue * 0.07;
            LuminanceDelta = Luminance2 - Luminance;

            //var Distance2 = (RedDelta * RedDelta * 0.21 + GreenDelta * GreenDelta * 0.72 + BlueDelta * BlueDelta * 0.07) * 0.75 + LuminanceDelta * LuminanceDelta;
            var Distance2 =
              (RedDelta * RedDelta +
                GreenDelta * GreenDelta +
                BlueDelta * BlueDelta) *
                0.5 +
              LuminanceDelta * LuminanceDelta;

            TotalDistance += Math.min(Distance, Distance2);
          }
        }

        if (TotalDistance < LastDistance) {
          BestColorsListIndex = ColorsListIndex;
          LastDistance = TotalDistance;
        }
      }

      Canvas.getContext("2d").drawImage(
        CanvasList[BestColorsListIndex].Canvas,
        X * 8,
        Y * 8,
        8,
        8,
        X * 8,
        Y * 8,
        8,
        8
      );
    }
  }
}

function RemapZxSpectrumImage2(Canvas, Colors, DitherPattern) {
  var Context = Canvas.getContext("2d");
  var Data = Context.getImageData(0, 0, Canvas.width, Canvas.height);

  var CanvasList = [];
  var ColorsMatrix = [
    Math.ceil(Canvas.width / 8) * Math.ceil(Canvas.height / 8),
  ];

  // Create a valid colors list.

  for (var Index1 = 0; Index1 < 8 - 1; Index1++) {
    for (var Index2 = Index1 + 1; Index2 < 8; Index2++) {
      // First color block entry.

      var NewCanvas = document.createElement("canvas");

      NewCanvas.width = Canvas.width;
      NewCanvas.height = Canvas.height;

      NewCanvas.getContext("2d").drawImage(Canvas, 0, 0);

      RemapImageLuminance(
        NewCanvas,
        [
          {
            Red: Colors[Index1].Red,
            Green: Colors[Index1].Green,
            Blue: Colors[Index1].Blue,
          },
          {
            Red: Colors[Index2].Red,
            Green: Colors[Index2].Green,
            Blue: Colors[Index2].Blue,
          },
        ],
        DitherPattern
      );

      CanvasList.push({
        Canvas: NewCanvas,
        Colors: [
          {
            Red: Colors[Index1].Red,
            Green: Colors[Index1].Green,
            Blue: Colors[Index1].Blue,
          },
          {
            Red: Colors[Index2].Red,
            Green: Colors[Index2].Green,
            Blue: Colors[Index2].Blue,
          },
        ],
      });

      // Second color block entry.

      NewCanvas = document.createElement("canvas");

      NewCanvas.width = Canvas.width;
      NewCanvas.height = Canvas.height;

      NewCanvas.getContext("2d").drawImage(Canvas, 0, 0);

      RemapImageLuminance(
        NewCanvas,
        [
          {
            Red: Colors[Index1 + 8].Red,
            Green: Colors[Index1 + 8].Green,
            Blue: Colors[Index1 + 8].Blue,
          },
          {
            Red: Colors[Index2 + 8].Red,
            Green: Colors[Index2 + 8].Green,
            Blue: Colors[Index2 + 8].Blue,
          },
        ],
        DitherPattern
      );

      CanvasList.push({
        Canvas: NewCanvas,
        Colors: [
          {
            Red: Colors[Index1 + 8].Red,
            Green: Colors[Index1 + 8].Green,
            Blue: Colors[Index1 + 8].Blue,
          },
          {
            Red: Colors[Index2 + 8].Red,
            Green: Colors[Index2 + 8].Green,
            Blue: Colors[Index2 + 8].Blue,
          },
        ],
      });
    }
  }

  // Create colors matrix.

  for (var Y = 0; Y < Math.ceil(Canvas.height / 8); Y++) {
    for (var X = 0; X < Math.ceil(Canvas.width / 8); X++) {
      var BestColorsListIndex = 0;
      var LastDistance = Number.MAX_VALUE;

      for (
        var ColorsListIndex = 0;
        ColorsListIndex < CanvasList.length;
        ColorsListIndex++
      ) {
        var TotalDistance = 0;
        var Data2 = CanvasList[ColorsListIndex].Canvas.getContext(
          "2d"
        ).getImageData(
          0,
          0,
          CanvasList[ColorsListIndex].Canvas.width,
          CanvasList[ColorsListIndex].Canvas.height
        );

        for (var Y2 = 0; Y2 < 8; Y2++) {
          for (var X2 = 0; X2 < 8; X2++) {
            var PixelIndex1 = (X * 8 + X2 + (Y * 8 + Y2) * Canvas.width) * 4;
            var PixelIndex2 =
              (X * 8 +
                X2 +
                (Y * 8 + Y2) * CanvasList[ColorsListIndex].Canvas.width) *
              4;

            var Alpha = Data.data[PixelIndex1 + 3];

            if (Alpha == 255) {
              var Red1 = Data.data[PixelIndex1];
              var Green1 = Data.data[PixelIndex1 + 1];
              var Blue1 = Data.data[PixelIndex1 + 2];
              var Luminance1 = Red1 * 0.21 + Green1 * 0.72 + Blue1 * 0.07;

              var Red2 = Data2.data[PixelIndex2];
              var Green2 = Data2.data[PixelIndex2 + 1];
              var Blue2 = Data2.data[PixelIndex2 + 2];
              var Luminance2 = Red2 * 0.21 + Green2 * 0.72 + Blue2 * 0.07;

              var RedDelta = Red2 - Red1;
              var GreenDelta = Green2 - Green1;
              var BlueDelta = Blue2 - Blue1;
              var LuminanceDelta = Luminance2 - Luminance1;

              //var Distance = (RedDelta * RedDelta * 0.21 + GreenDelta * GreenDelta * 0.72 + BlueDelta * BlueDelta * 0.07) * 0.75 + LuminanceDelta * LuminanceDelta;
              //var Distance = (RedDelta * RedDelta + GreenDelta * GreenDelta + BlueDelta * BlueDelta) * 0.5 + LuminanceDelta * LuminanceDelta;
              var Distance =
                RedDelta * RedDelta +
                GreenDelta * GreenDelta +
                BlueDelta * BlueDelta;

              TotalDistance += Distance;
            }
          }
        }

        if (TotalDistance < LastDistance) {
          BestColorsListIndex = ColorsListIndex;
          LastDistance = TotalDistance;
        }
      }

      Canvas.getContext("2d").drawImage(
        CanvasList[BestColorsListIndex].Canvas,
        X * 8,
        Y * 8,
        8,
        8,
        X * 8,
        Y * 8,
        8,
        8
      );
    }
  }
}

function RemapZxSpectrumImage3(Canvas, Colors, DitherPattern) {
  var Context = Canvas.getContext("2d");
  var Data = Context.getImageData(0, 0, Canvas.width, Canvas.height);

  var CanvasList = [];
  var ColorsMatrix = [
    Math.ceil(Canvas.width / 8) * Math.ceil(Canvas.height / 8),
  ];

  // Create a valid colors list.

  for (var Index1 = 0; Index1 < 8 - 1; Index1++) {
    for (var Index2 = Index1 + 1; Index2 < 8; Index2++) {
      // First color block entry.

      var NewCanvas = document.createElement("canvas");

      NewCanvas.width = Canvas.width;
      NewCanvas.height = Canvas.height;

      NewCanvas.getContext("2d").drawImage(Canvas, 0, 0);

      RemapImageLuminance(
        NewCanvas,
        [
          {
            Red: Colors[Index1].Red,
            Green: Colors[Index1].Green,
            Blue: Colors[Index1].Blue,
          },
          {
            Red: Colors[Index2].Red,
            Green: Colors[Index2].Green,
            Blue: Colors[Index2].Blue,
          },
        ],
        DitherPattern
      );

      CanvasList.push({
        Canvas: NewCanvas,
        Colors: [
          {
            Red: Colors[Index1].Red,
            Green: Colors[Index1].Green,
            Blue: Colors[Index1].Blue,
          },
          {
            Red: Colors[Index2].Red,
            Green: Colors[Index2].Green,
            Blue: Colors[Index2].Blue,
          },
        ],
      });

      // Second color block entry.

      NewCanvas = document.createElement("canvas");

      NewCanvas.width = Canvas.width;
      NewCanvas.height = Canvas.height;

      NewCanvas.getContext("2d").drawImage(Canvas, 0, 0);

      RemapImageLuminance(
        NewCanvas,
        [
          {
            Red: Colors[Index1 + 8].Red,
            Green: Colors[Index1 + 8].Green,
            Blue: Colors[Index1 + 8].Blue,
          },
          {
            Red: Colors[Index2 + 8].Red,
            Green: Colors[Index2 + 8].Green,
            Blue: Colors[Index2 + 8].Blue,
          },
        ],
        DitherPattern
      );

      CanvasList.push({
        Canvas: NewCanvas,
        Colors: [
          {
            Red: Colors[Index1 + 8].Red,
            Green: Colors[Index1 + 8].Green,
            Blue: Colors[Index1 + 8].Blue,
          },
          {
            Red: Colors[Index2 + 8].Red,
            Green: Colors[Index2 + 8].Green,
            Blue: Colors[Index2 + 8].Blue,
          },
        ],
      });
    }
  }

  // Create colors matrix.

  for (var Y = 0; Y < Math.ceil(Canvas.height / 8); Y++) {
    for (var X = 0; X < Math.ceil(Canvas.width / 8); X++) {
      var BestColorsListIndex = 0;
      var LastDistance = Number.MAX_VALUE;

      for (
        var ColorsListIndex = 0;
        ColorsListIndex < CanvasList.length;
        ColorsListIndex++
      ) {
        var Red1 = 0;
        var Green1 = 0;
        var Blue1 = 0;

        var Red2 = 0;
        var Green2 = 0;
        var Blue2 = 0;

        var Data2 = CanvasList[ColorsListIndex].Canvas.getContext(
          "2d"
        ).getImageData(
          0,
          0,
          CanvasList[ColorsListIndex].Canvas.width,
          CanvasList[ColorsListIndex].Canvas.height
        );

        for (var Y2 = 0; Y2 < 8; Y2++) {
          for (var X2 = 0; X2 < 8; X2++) {
            var PixelIndex1 = (X * 8 + X2 + (Y * 8 + Y2) * Canvas.width) * 4;
            var PixelIndex2 =
              (X * 8 +
                X2 +
                (Y * 8 + Y2) * CanvasList[ColorsListIndex].Canvas.width) *
              4;

            Red1 += Data.data[PixelIndex1];
            Green1 += Data.data[PixelIndex1 + 1];
            Blue1 += Data.data[PixelIndex1 + 2];

            Red2 += Data2.data[PixelIndex2];
            Green2 += Data2.data[PixelIndex2 + 1];
            Blue2 += Data2.data[PixelIndex2 + 2];
          }
        }

        var Red1 = Red1 >> 6;
        var Green1 = Green1 >> 6;
        var Blue1 = Blue1 >> 6;
        var Luminance1 = Red1 * 0.21 + Green1 * 0.72 + Blue1 * 0.07;

        var Red2 = Red2 >> 6;
        var Green2 = Green2 >> 6;
        var Blue2 = Blue2 >> 6;
        var Luminance2 = Red2 * 0.21 + Green2 * 0.72 + Blue2 * 0.07;

        var RedDelta = Red2 - Red1;
        var GreenDelta = Green2 - Green1;
        var BlueDelta = Blue2 - Blue1;
        var LuminanceDelta = Luminance2 - Luminance1;

        //var Distance = (RedDelta * RedDelta * 0.21 + GreenDelta * GreenDelta * 0.72 + BlueDelta * BlueDelta * 0.07) * 0.75 + LuminanceDelta * LuminanceDelta;
        //var Distance = (RedDelta * RedDelta + GreenDelta * GreenDelta + BlueDelta * BlueDelta) * 0.5 + LuminanceDelta * LuminanceDelta;
        //var Distance = RedDelta * RedDelta + GreenDelta * GreenDelta + BlueDelta * BlueDelta;
        //var Distance = LuminanceDelta * LuminanceDelta;
        var Distance =
          RedDelta * RedDelta * 0.21 +
          GreenDelta * GreenDelta * 0.72 +
          BlueDelta * BlueDelta * 0.07;

        if (Distance < LastDistance) {
          BestColorsListIndex = ColorsListIndex;
          LastDistance = Distance;
        }
      }

      Canvas.getContext("2d").drawImage(
        CanvasList[BestColorsListIndex].Canvas,
        X * 8,
        Y * 8,
        8,
        8,
        X * 8,
        Y * 8,
        8,
        8
      );
    }
  }
}

function QuantizeSimple(Canvas, ColorCount) {
  var Colors = [];

  for (var Index = 0; Index < ColorCount; Index++)
    Colors.push({ Red: 0, Green: 0, Blue: 0, Count: 0 });

  var Context = Canvas.getContext("2d");
  var Data = Context.getImageData(0, 0, Canvas.width, Canvas.height);

  for (var Y = 0; Y < Canvas.height; Y++) {
    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * Canvas.width) * 4;

      var Red = Data.data[PixelIndex];
      var Green = Data.data[PixelIndex + 1];
      var Blue = Data.data[PixelIndex + 2];

      var QuantizedColors = [];

      QuantizedColors.push({ Red: Red, Green: Green, Blue: Blue, Count: 1 });

      var ColorIndex;

      for (ColorIndex = 0; ColorIndex < Colors.length; ColorIndex++) {
        var Color = Colors[ColorIndex];

        if (Color.Red == Red && Color.Green == Green && Color.Blue == Blue) {
          Color.Count++;

          break;
        }

        if (Color.Count == 0) {
          Color.Red = Red;
          Color.Green = Green;
          Color.Blue = Blue;

          Color.Count = 1;

          break;
        }

        QuantizedColors.push(Color);
      }

      if (ColorIndex == Colors.length) {
        var LastDistance = Number.MAX_VALUE;
        var Color1;
        var Color2;

        for (var Index1 = 0; Index1 < QuantizedColors.length - 1; Index1++) {
          for (
            var Index2 = Index1 + 1;
            Index2 < QuantizedColors.length;
            Index2++
          ) {
            var RedDelta =
              QuantizedColors[Index1].Red - QuantizedColors[Index2].Red;
            var GreenDelta =
              QuantizedColors[Index1].Green - QuantizedColors[Index2].Green;
            var BlueDelta =
              QuantizedColors[Index1].Blue - QuantizedColors[Index2].Blue;

            var Distance =
              RedDelta * RedDelta +
              GreenDelta * GreenDelta +
              BlueDelta * BlueDelta;

            if (Distance < LastDistance) {
              LastDistance = Distance;

              Color1 = QuantizedColors[Index1];
              Color2 = QuantizedColors[Index2];
            }
          }
        }

        Color2.Red =
          (Color1.Red * Color1.Count + Color2.Red * Color2.Count) /
          (Color1.Count + Color2.Count);
        Color2.Green =
          (Color1.Green * Color1.Count + Color2.Green * Color2.Count) /
          (Color1.Count + Color2.Count);
        Color2.Blue =
          (Color1.Blue * Color1.Count + Color2.Blue * Color2.Count) /
          (Color1.Count + Color2.Count);

        Color2.Count = Color1.Count + Color2.Count;

        if (Color1 != QuantizedColors[0]) {
          Color1.Red = QuantizedColors[0].Red;
          Color1.Green = QuantizedColors[0].Green;
          Color1.Blue = QuantizedColors[0].Blue;

          Color1.Count = QuantizedColors[0].Count;
        }
      }
    }
  }

  Colors.sort(function (Color1, Color2) {
    return (
      SrgbToRgb(Color1.Red) * 0.21 +
      SrgbToRgb(Color1.Green) * 0.72 +
      SrgbToRgb(Color1.Blue) * 0.07 -
      (SrgbToRgb(Color2.Red) * 0.21 +
        SrgbToRgb(Color2.Green) * 0.72 +
        SrgbToRgb(Color2.Blue) * 0.07)
    );
  });

  return Colors;
}

function RemapLineColorsImage(Canvas, LineColors, DitherPattern) {
  var Context = Canvas.getContext("2d");
  var Data = Context.getImageData(0, 0, Canvas.width, Canvas.height);

  for (var Y = 0; Y < Canvas.height; Y++) {
    var Colors = LineColors[Y];

    var MixedColors = [];

    if (DitherPattern && DitherPattern[0] == 1 && Colors.length <= 64) {
      var ColorCount = Colors.length;

      for (var Index1 = 0; Index1 < ColorCount; Index1++) {
        for (var Index2 = Index1 + 1; Index2 < ColorCount; Index2++) {
          var Luminance1 =
            Colors[Index1].Red * 0.21 +
            Colors[Index1].Green * 0.72 +
            Colors[Index1].Blue * 0.07;
          var Luminance2 =
            Colors[Index2].Red * 0.21 +
            Colors[Index2].Green * 0.72 +
            Colors[Index2].Blue * 0.07;
          var LuminanceDeltaSquare =
            (Luminance1 - Luminance2) * (Luminance1 - Luminance2);

          //if(LuminanceDeltaSquare < 48 * 48)
          MixedColors.push({
            Index1: Index1,
            Index2: Index2,
            Red: Math.round((Colors[Index1].Red + Colors[Index2].Red) / 2.0),
            Green: Math.round(
              (Colors[Index1].Green + Colors[Index2].Green) / 2.0
            ),
            Blue: Math.round((Colors[Index1].Blue + Colors[Index2].Blue) / 2.0),
          });
        }
      }
    }

    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * Canvas.width) * 4;

      var Red = Data.data[PixelIndex];
      var Green = Data.data[PixelIndex + 1];
      var Blue = Data.data[PixelIndex + 2];
      var Alpha = Data.data[PixelIndex + 3];
      var Luminance = Red * 0.21 + Green * 0.72 + Blue * 0.07;

      if (Alpha == 255) {
        // Find the matching color index.

        var LastDistance = Number.MAX_VALUE;
        var RemappedColorIndex = 0;

        for (var ColorIndex = 0; ColorIndex < Colors.length; ColorIndex++) {
          var RedDelta = Colors[ColorIndex].Red - Red;
          var GreenDelta = Colors[ColorIndex].Green - Green;
          var BlueDelta = Colors[ColorIndex].Blue - Blue;

          var Luminance2 =
            Colors[ColorIndex].Red * 0.21 +
            Colors[ColorIndex].Green * 0.72 +
            Colors[ColorIndex].Blue * 0.07;
          var LuminanceDelta = Luminance2 - Luminance;

          //var Distance = (RedDelta * RedDelta * 0.21 + GreenDelta * GreenDelta * 0.72 + BlueDelta * BlueDelta * 0.07) * 0.75 + LuminanceDelta * LuminanceDelta;
          var Distance =
            (RedDelta * RedDelta +
              GreenDelta * GreenDelta +
              BlueDelta * BlueDelta) *
              0.5 +
            LuminanceDelta * LuminanceDelta;

          if (Distance < LastDistance) {
            RemappedColorIndex = ColorIndex;
            LastDistance = Distance;
          }
        }

        if (DitherPattern) {
          if (DitherPattern[0] == 1) {
            // Checker pattern.
            for (
              var ColorIndex = 0;
              ColorIndex < MixedColors.length;
              ColorIndex++
            ) {
              var RedDelta = MixedColors[ColorIndex].Red - Red;
              var GreenDelta = MixedColors[ColorIndex].Green - Green;
              var BlueDelta = MixedColors[ColorIndex].Blue - Blue;

              var Luminance2 =
                MixedColors[ColorIndex].Red * 0.21 +
                MixedColors[ColorIndex].Green * 0.72 +
                MixedColors[ColorIndex].Blue * 0.07;
              var LuminanceDelta = Luminance2 - Luminance;

              //var Distance = (RedDelta * RedDelta * 0.21 + GreenDelta * GreenDelta * 0.72 + BlueDelta * BlueDelta * 0.07) * 0.75 + LuminanceDelta * LuminanceDelta;
              var Distance1 =
                (RedDelta * RedDelta +
                  GreenDelta * GreenDelta +
                  BlueDelta * BlueDelta) *
                  0.5 +
                LuminanceDelta * LuminanceDelta;

              RedDelta = Colors[MixedColors[ColorIndex].Index1].Red - Red;
              GreenDelta = Colors[MixedColors[ColorIndex].Index1].Green - Green;
              BlueDelta = Colors[MixedColors[ColorIndex].Index1].Blue - Blue;

              Luminance2 =
                Colors[MixedColors[ColorIndex].Index1].Red * 0.21 +
                Colors[MixedColors[ColorIndex].Index1].Green * 0.72 +
                Colors[MixedColors[ColorIndex].Index1].Blue * 0.07;
              LuminanceDelta = Luminance2 - Luminance;

              //var Distance = (RedDelta * RedDelta * 0.21 + GreenDelta * GreenDelta * 0.72 + BlueDelta * BlueDelta * 0.07) * 0.75 + LuminanceDelta * LuminanceDelta;
              var Distance2 =
                (RedDelta * RedDelta +
                  GreenDelta * GreenDelta +
                  BlueDelta * BlueDelta) *
                  0.5 +
                LuminanceDelta * LuminanceDelta;

              RedDelta = Colors[MixedColors[ColorIndex].Index2].Red - Red;
              GreenDelta = Colors[MixedColors[ColorIndex].Index2].Green - Green;
              BlueDelta = Colors[MixedColors[ColorIndex].Index2].Blue - Blue;

              Luminance2 =
                Colors[MixedColors[ColorIndex].Index2].Red * 0.21 +
                Colors[MixedColors[ColorIndex].Index2].Green * 0.72 +
                Colors[MixedColors[ColorIndex].Index2].Blue * 0.07;
              LuminanceDelta = Luminance2 - Luminance;

              //var Distance = (RedDelta * RedDelta * 0.21 + GreenDelta * GreenDelta * 0.72 + BlueDelta * BlueDelta * 0.07) * 0.75 + LuminanceDelta * LuminanceDelta;
              var Distance3 =
                (RedDelta * RedDelta +
                  GreenDelta * GreenDelta +
                  BlueDelta * BlueDelta) *
                  0.5 +
                LuminanceDelta * LuminanceDelta;

              var Distance = (Distance1 * 8 + Distance2 + Distance3) / 10;

              if (Distance < LastDistance) {
                RemappedColorIndex =
                  (X ^ Y) & 1
                    ? MixedColors[ColorIndex].Index1
                    : MixedColors[ColorIndex].Index2;
                LastDistance = Distance;
              }
            }
          } // Error diffusion.
          else {
            var RedDelta = Colors[RemappedColorIndex].Red - Red;
            var GreenDelta = Colors[RemappedColorIndex].Green - Green;
            var BlueDelta = Colors[RemappedColorIndex].Blue - Blue;

            if (X < Canvas.width - 2) {
              if (DitherPattern[4]) {
                Data.data[PixelIndex + 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 8] - RedDelta * DitherPattern[4]
                    )
                  )
                );
                Data.data[PixelIndex + 8 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 8 + 1] -
                        GreenDelta * DitherPattern[4]
                    )
                  )
                );
                Data.data[PixelIndex + 8 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 8 + 2] -
                        BlueDelta * DitherPattern[4]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 1 && DitherPattern[9]) {
                Data.data[PixelIndex + Canvas.width * 4 + 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 8] -
                        RedDelta * DitherPattern[9]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 8 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 8 + 1] -
                        GreenDelta * DitherPattern[9]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 8 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 8 + 2] -
                        BlueDelta * DitherPattern[9]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[14]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 + 8] -
                        RedDelta * DitherPattern[14]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 1] -
                          GreenDelta * DitherPattern[14]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 2] -
                          BlueDelta * DitherPattern[14]
                      )
                    )
                  );
              }
            }

            if (X < Canvas.width - 1) {
              if (DitherPattern[3]) {
                Data.data[PixelIndex + 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 4] - RedDelta * DitherPattern[3]
                    )
                  )
                );
                Data.data[PixelIndex + 4 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 4 + 1] -
                        GreenDelta * DitherPattern[3]
                    )
                  )
                );
                Data.data[PixelIndex + 4 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 4 + 2] -
                        BlueDelta * DitherPattern[3]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 1 && DitherPattern[8]) {
                Data.data[PixelIndex + Canvas.width * 4 + 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 4] -
                        RedDelta * DitherPattern[8]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 4 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 4 + 1] -
                        GreenDelta * DitherPattern[8]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 4 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 4 + 2] -
                        BlueDelta * DitherPattern[8]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[13]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 + 4] -
                        RedDelta * DitherPattern[13]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 1] -
                          GreenDelta * DitherPattern[13]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 2] -
                          BlueDelta * DitherPattern[13]
                      )
                    )
                  );
              }
            }

            if (Y < Canvas.height - 1 && DitherPattern[7]) {
              Data.data[PixelIndex + Canvas.width * 4] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 4] -
                      RedDelta * DitherPattern[7]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 4 + 1] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 4 + 1] -
                      GreenDelta * DitherPattern[7]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 4 + 2] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 4 + 2] -
                      BlueDelta * DitherPattern[7]
                  )
                )
              );
            }

            if (Y < Canvas.height - 2 && DitherPattern[12]) {
              Data.data[PixelIndex + Canvas.width * 2 * 4] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 2 * 4] -
                      RedDelta * DitherPattern[12]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 2 * 4 + 1] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 2 * 4 + 1] -
                      GreenDelta * DitherPattern[12]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 2 * 4 + 2] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 2 * 4 + 2] -
                      BlueDelta * DitherPattern[12]
                  )
                )
              );
            }

            if (X > 0) {
              if (Y < Canvas.height - 1 && DitherPattern[6]) {
                Data.data[PixelIndex + Canvas.width * 4 - 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 4] -
                        RedDelta * DitherPattern[6]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 4 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 4 + 1] -
                        GreenDelta * DitherPattern[6]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 4 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 4 + 2] -
                        BlueDelta * DitherPattern[6]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[11]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 - 4] -
                        RedDelta * DitherPattern[11]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 1] -
                          GreenDelta * DitherPattern[11]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 2] -
                          BlueDelta * DitherPattern[11]
                      )
                    )
                  );
              }
            }

            if (X > 1) {
              if (Y < Canvas.height - 1 && DitherPattern[5]) {
                Data.data[PixelIndex + Canvas.width * 4 - 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 8] -
                        RedDelta * DitherPattern[5]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 8 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 8 + 1] -
                        GreenDelta * DitherPattern[5]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 8 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 8 + 2] -
                        BlueDelta * DitherPattern[5]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[10]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 - 8] -
                        RedDelta * DitherPattern[10]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 1] -
                          GreenDelta * DitherPattern[10]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 2] -
                          BlueDelta * DitherPattern[10]
                      )
                    )
                  );
              }
            }
          }
        }

        Data.data[PixelIndex] = Colors[RemappedColorIndex].Red;
        Data.data[PixelIndex + 1] = Colors[RemappedColorIndex].Green;
        Data.data[PixelIndex + 2] = Colors[RemappedColorIndex].Blue;
        Data.data[PixelIndex + 3] = 255;
      }
    }
  }

  Context.putImageData(Data, 0, 0);
}

function RemapNeochromeRasterImage(
  Canvas,
  ImageInfos,
  BitsPerColor,
  DitherPattern
) {
  var ShadesPerColor = 1 << BitsPerColor;
  var ShadesScale = (ShadesPerColor - 1) / 255;
  var InverseShadesScale = 1 / ShadesScale;

  ImageInfos.SpectrumPalettes = [];
  ImageInfos.ConvertedBitsPerColor = BitsPerColor;

  var OriginalCanvas = document.createElement("canvas");

  OriginalCanvas.width = Canvas.width;
  OriginalCanvas.height = Canvas.height;

  var OriginalContext = OriginalCanvas.getContext("2d");

  OriginalContext.drawImage(Canvas, 0, 0, Canvas.width, Canvas.height);

  var OriginalData = OriginalContext.getImageData(
    0,
    0,
    OriginalCanvas.width,
    OriginalCanvas.height
  );

  var Context = Canvas.getContext("2d");
  var Data = Context.getImageData(0, 0, Canvas.width, Canvas.height);

  for (var Y = 0; Y < Canvas.height; Y++) {
    var ColorSlots = [];

    for (var ColorSlotIndex = 0; ColorSlotIndex < 16; ColorSlotIndex++) {
      var Red = 0;
      var Green = 0;
      var Blue = 0;

      var Count = 0;

      if (ColorSlotIndex == 0) {
        Count = 100000;
      }

      ColorSlots.push({ Red: Red, Green: Green, Blue: Blue, Count: Count });
    }

    var LineColorCounts = {};

    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * Canvas.width) * 4;

      var Red = OriginalData.data[PixelIndex];
      var Green = OriginalData.data[PixelIndex + 1];
      var Blue = OriginalData.data[PixelIndex + 2];
      var Alpha = OriginalData.data[PixelIndex + 3];
      var Luminance = Red * 0.21 + Green * 0.72 + Blue * 0.07;

      if (Alpha == 255) {
        //Red = Math.round(Red * ShadesScale) * InverseShadesScale;
        //Green = Math.round(Green * ShadesScale) * InverseShadesScale;
        //Blue = Math.round(Blue * ShadesScale) * InverseShadesScale;

        var LineColorIndex = (Red << 16) | (Green << 8) | Blue;

        if (LineColorCounts[LineColorIndex]) LineColorCounts[LineColorIndex]++;
        else LineColorCounts[LineColorIndex] = 1;

        var Colors = [];

        Colors.push({
          Red: Red,
          Green: Green,
          Blue: Blue,
          Count: LineColorCounts[LineColorIndex],
        });

        var ColorIndex;

        for (ColorIndex = 0; ColorIndex < 16; ColorIndex++) {
          var SpectrumColor = ColorSlots[ColorIndex];

          if (
            SpectrumColor.Red == Red &&
            SpectrumColor.Green == Green &&
            SpectrumColor.Blue == Blue
          ) {
            SpectrumColor.Count++;

            break;
          }

          if (SpectrumColor.Count == 0) {
            SpectrumColor.Red = Red;
            SpectrumColor.Green = Green;
            SpectrumColor.Blue = Blue;

            SpectrumColor.Count = LineColorCounts[LineColorIndex];

            break;
          }

          SpectrumColor.ColorSlot = ColorIndex;

          Colors.push(SpectrumColor);
        }

        if (ColorIndex == 16) {
          var LastDistance = Number.MAX_VALUE;
          var Color1;
          var Color2;

          for (var Index1 = 0; Index1 < Colors.length - 1; Index1++) {
            for (var Index2 = Index1 + 1; Index2 < Colors.length; Index2++) {
              var Red1 = Math.round(
                Math.round(Colors[Index1].Red * ShadesScale) *
                  InverseShadesScale
              );
              var Green1 = Math.round(
                Math.round(Colors[Index1].Green * ShadesScale) *
                  InverseShadesScale
              );
              var Blue1 = Math.round(
                Math.round(Colors[Index1].Blue * ShadesScale) *
                  InverseShadesScale
              );

              var Red2 = Math.round(
                Math.round(Colors[Index2].Red * ShadesScale) *
                  InverseShadesScale
              );
              var Green2 = Math.round(
                Math.round(Colors[Index2].Green * ShadesScale) *
                  InverseShadesScale
              );
              var Blue2 = Math.round(
                Math.round(Colors[Index2].Blue * ShadesScale) *
                  InverseShadesScale
              );

              var Luminance1 = Red1 * 0.21 + Green1 * 0.72 + Blue1 * 0.07;
              var Luminance2 = Red2 * 0.21 + Green2 * 0.72 + Blue2 * 0.07;

              var RedDelta = Red1 - Red2;
              var GreenDelta = Green1 - Green2;
              var BlueDelta = Blue1 - Blue2;

              var LuminanceDelta = Luminance2 - Luminance1;

              var Distance = ColorDistance(
                RedDelta,
                GreenDelta,
                BlueDelta,
                LuminanceDelta
              );

              if (Distance < LastDistance) {
                LastDistance = Distance;

                Color1 = Colors[Index1];
                Color2 = Colors[Index2];
              }
            }
          }

          if (Color1 == Colors[0]) {
            Color2.Red =
              (Color1.Red * Color1.Count + Color2.Red * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Green =
              (Color1.Green * Color1.Count + Color2.Green * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Blue =
              (Color1.Blue * Color1.Count + Color2.Blue * Color2.Count) /
              (Color1.Count + Color2.Count);

            Color2.Count = Color1.Count + Color2.Count;
          } else if (Color1.ColorSlot < Color2.ColorSlot) {
            Color1.Red =
              (Color1.Red * Color1.Count + Color2.Red * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color1.Green =
              (Color1.Green * Color1.Count + Color2.Green * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color1.Blue =
              (Color1.Blue * Color1.Count + Color2.Blue * Color2.Count) /
              (Color1.Count + Color2.Count);

            Color1.Count = Color1.Count + Color2.Count;

            Color2.Red = Colors[0].Red;
            Color2.Green = Colors[0].Green;
            Color2.Blue = Colors[0].Blue;

            Color2.Count = Colors[0].Count;
          } else {
            Color2.Red =
              (Color1.Red * Color1.Count + Color2.Red * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Green =
              (Color1.Green * Color1.Count + Color2.Green * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Blue =
              (Color1.Blue * Color1.Count + Color2.Blue * Color2.Count) /
              (Color1.Count + Color2.Count);

            Color2.Count = Color1.Count + Color2.Count;

            Color1.Red = Colors[0].Red;
            Color1.Green = Colors[0].Green;
            Color1.Blue = Colors[0].Blue;

            Color1.Count = Colors[0].Count;
          }
        }

        // Find the matching color index.

        var LastDistance = Number.MAX_VALUE;
        var RemappedColor = {};
        var SpectrumColor = {};

        for (var ColorIndex = 0; ColorIndex < 16; ColorIndex++) {
          SpectrumColor.Red = ColorSlots[ColorIndex].Red;
          SpectrumColor.Green = ColorSlots[ColorIndex].Green;
          SpectrumColor.Blue = ColorSlots[ColorIndex].Blue;
          SpectrumColor.Count = ColorSlots[ColorIndex].Count;

          if (SpectrumColor.Count > 0) {
            SpectrumColor.Red = Math.round(
              Math.round(SpectrumColor.Red * ShadesScale) * InverseShadesScale
            );
            SpectrumColor.Green = Math.round(
              Math.round(SpectrumColor.Green * ShadesScale) * InverseShadesScale
            );
            SpectrumColor.Blue = Math.round(
              Math.round(SpectrumColor.Blue * ShadesScale) * InverseShadesScale
            );

            var RedDelta = SpectrumColor.Red - Red;
            var GreenDelta = SpectrumColor.Green - Green;
            var BlueDelta = SpectrumColor.Blue - Blue;

            var Luminance2 =
              SpectrumColor.Red * 0.21 +
              SpectrumColor.Green * 0.72 +
              SpectrumColor.Blue * 0.07;
            var LuminanceDelta = Luminance2 - Luminance;

            var Distance = ColorDistance(
              RedDelta,
              GreenDelta,
              BlueDelta,
              LuminanceDelta
            );

            if (Distance < LastDistance) {
              RemappedColor.Red = SpectrumColor.Red;
              RemappedColor.Green = SpectrumColor.Green;
              RemappedColor.Blue = SpectrumColor.Blue;

              LastDistance = Distance;
            }
          }
        }

        for (var ColorSlotIndex = 0; ColorSlotIndex < 16; ColorSlotIndex++) {
          if (ColorSlots[ColorSlotIndex].Red != -1) {
            ColorSlots[ColorSlotIndex].Red = Math.round(
              Math.round(ColorSlots[ColorSlotIndex].Red * ShadesScale) *
                InverseShadesScale
            );
            ColorSlots[ColorSlotIndex].Green = Math.round(
              Math.round(ColorSlots[ColorSlotIndex].Green * ShadesScale) *
                InverseShadesScale
            );
            ColorSlots[ColorSlotIndex].Blue = Math.round(
              Math.round(ColorSlots[ColorSlotIndex].Blue * ShadesScale) *
                InverseShadesScale
            );
          }
        }

        // Error distribution for the following pixels in this line.

        var RedDelta = RemappedColor.Red - OriginalData.data[PixelIndex];
        var GreenDelta =
          RemappedColor.Green - OriginalData.data[PixelIndex + 1];
        var BlueDelta = RemappedColor.Blue - OriginalData.data[PixelIndex + 2];

        var Distribution1 = 0.6;
        var Distribution2 = 0.3;
        var Distribution3 = 0.1;
        var Intensity = 0.87;

        if (X < Canvas.width - 1) {
          OriginalData.data[PixelIndex + 4] = Math.round(
            Math.min(
              255,
              Math.max(
                0,
                OriginalData.data[PixelIndex + 4] -
                  RedDelta * Distribution1 * Intensity
              )
            )
          );
          OriginalData.data[PixelIndex + 4 + 1] = Math.round(
            Math.min(
              255,
              Math.max(
                0,
                OriginalData.data[PixelIndex + 4 + 1] -
                  GreenDelta * Distribution1 * Intensity
              )
            )
          );
          OriginalData.data[PixelIndex + 4 + 2] = Math.round(
            Math.min(
              255,
              Math.max(
                0,
                OriginalData.data[PixelIndex + 4 + 2] -
                  BlueDelta * Distribution1 * Intensity
              )
            )
          );
        }

        if (X < Canvas.width - 2) {
          OriginalData.data[PixelIndex + 4 * 2] = Math.round(
            Math.min(
              255,
              Math.max(
                0,
                OriginalData.data[PixelIndex + 4 * 2] -
                  RedDelta * Distribution2 * Intensity
              )
            )
          );
          OriginalData.data[PixelIndex + 4 * 2 + 1] = Math.round(
            Math.min(
              255,
              Math.max(
                0,
                OriginalData.data[PixelIndex + 4 * 2 + 1] -
                  GreenDelta * Distribution2 * Intensity
              )
            )
          );
          OriginalData.data[PixelIndex + 4 * 2 + 2] = Math.round(
            Math.min(
              255,
              Math.max(
                0,
                OriginalData.data[PixelIndex + 4 * 2 + 2] -
                  BlueDelta * Distribution2 * Intensity
              )
            )
          );
        }

        if (X < Canvas.width - 3) {
          OriginalData.data[PixelIndex + 4 * 3] = Math.round(
            Math.min(
              255,
              Math.max(
                0,
                OriginalData.data[PixelIndex + 4 * 3] -
                  RedDelta * Distribution3 * Intensity
              )
            )
          );
          OriginalData.data[PixelIndex + 4 * 3 + 1] = Math.round(
            Math.min(
              255,
              Math.max(
                0,
                OriginalData.data[PixelIndex + 4 * 3 + 1] -
                  GreenDelta * Distribution3 * Intensity
              )
            )
          );
          OriginalData.data[PixelIndex + 4 * 3 + 2] = Math.round(
            Math.min(
              255,
              Math.max(
                0,
                OriginalData.data[PixelIndex + 4 * 3 + 2] -
                  BlueDelta * Distribution3 * Intensity
              )
            )
          );
        }
        /*
        var RedDelta = RemappedColor.Red - OriginalData.data[PixelIndex];
        var GreenDelta = RemappedColor.Green - OriginalData.data[PixelIndex + 1];
        var BlueDelta = RemappedColor.Blue - OriginalData.data[PixelIndex + 2];

        if(X < Canvas.width - 1)
        {
          OriginalData.data[PixelIndex + 4] = Math.round(Math.min(255, Math.max(0, OriginalData.data[PixelIndex + 4] - RedDelta)));
          OriginalData.data[PixelIndex + 4 + 1] = Math.round(Math.min(255, Math.max(0, OriginalData.data[PixelIndex + 4 + 1] - GreenDelta)));
          OriginalData.data[PixelIndex + 4 + 2] = Math.round(Math.min(255, Math.max(0, OriginalData.data[PixelIndex + 4 + 2] - BlueDelta)));
        }
*/
      }
    }

    var SpectrumColors = [];

    for (var SlotIndex = 0; SlotIndex < 16; SlotIndex++)
      SpectrumColors.push({
        Red: ColorSlots[SlotIndex].Red,
        Green: ColorSlots[SlotIndex].Green,
        Blue: ColorSlots[SlotIndex].Blue,
      });

    ImageInfos.SpectrumPalettes.push(SpectrumColors);

    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * Canvas.width) * 4;

      var Red = Data.data[PixelIndex];
      var Green = Data.data[PixelIndex + 1];
      var Blue = Data.data[PixelIndex + 2];
      var Alpha = Data.data[PixelIndex + 3];
      var Luminance = Red * 0.21 + Green * 0.72 + Blue * 0.07;

      if (Alpha == 255) {
        // Find the matching color index.

        var LastDistance = Number.MAX_VALUE;
        var RemappedColor = {};
        var SpectrumColor = {};

        for (var ColorIndex = 0; ColorIndex < 16; ColorIndex++) {
          SpectrumColor.Red = ColorSlots[ColorIndex].Red;
          SpectrumColor.Green = ColorSlots[ColorIndex].Green;
          SpectrumColor.Blue = ColorSlots[ColorIndex].Blue;

          SpectrumColor.Red = Math.round(
            Math.round(SpectrumColor.Red * ShadesScale) * InverseShadesScale
          );
          SpectrumColor.Green = Math.round(
            Math.round(SpectrumColor.Green * ShadesScale) * InverseShadesScale
          );
          SpectrumColor.Blue = Math.round(
            Math.round(SpectrumColor.Blue * ShadesScale) * InverseShadesScale
          );

          var RedDelta = SpectrumColor.Red - Red;
          var GreenDelta = SpectrumColor.Green - Green;
          var BlueDelta = SpectrumColor.Blue - Blue;

          var Luminance2 =
            SpectrumColor.Red * 0.21 +
            SpectrumColor.Green * 0.72 +
            SpectrumColor.Blue * 0.07;
          var LuminanceDelta = Luminance2 - Luminance;

          var Distance = ColorDistance(
            RedDelta,
            GreenDelta,
            BlueDelta,
            LuminanceDelta
          );

          if (Distance < LastDistance) {
            RemappedColor.Red = SpectrumColor.Red;
            RemappedColor.Green = SpectrumColor.Green;
            RemappedColor.Blue = SpectrumColor.Blue;

            LastDistance = Distance;
          }
        }

        if (DitherPattern) {
          {
            var RedDelta = RemappedColor.Red - Red;
            var GreenDelta = RemappedColor.Green - Green;
            var BlueDelta = RemappedColor.Blue - Blue;

            if (X < Canvas.width - 2) {
              if (DitherPattern[4]) {
                Data.data[PixelIndex + 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 8] - RedDelta * DitherPattern[4]
                    )
                  )
                );
                Data.data[PixelIndex + 8 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 8 + 1] -
                        GreenDelta * DitherPattern[4]
                    )
                  )
                );
                Data.data[PixelIndex + 8 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 8 + 2] -
                        BlueDelta * DitherPattern[4]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 1 && DitherPattern[9]) {
                Data.data[PixelIndex + Canvas.width * 4 + 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 8] -
                        RedDelta * DitherPattern[9]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 8 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 8 + 1] -
                        GreenDelta * DitherPattern[9]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 8 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 8 + 2] -
                        BlueDelta * DitherPattern[9]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[14]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 + 8] -
                        RedDelta * DitherPattern[14]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 1] -
                          GreenDelta * DitherPattern[14]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 2] -
                          BlueDelta * DitherPattern[14]
                      )
                    )
                  );
              }
            }

            if (X < Canvas.width - 1) {
              if (DitherPattern[3]) {
                Data.data[PixelIndex + 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 4] - RedDelta * DitherPattern[3]
                    )
                  )
                );
                Data.data[PixelIndex + 4 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 4 + 1] -
                        GreenDelta * DitherPattern[3]
                    )
                  )
                );
                Data.data[PixelIndex + 4 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 4 + 2] -
                        BlueDelta * DitherPattern[3]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 1 && DitherPattern[8]) {
                Data.data[PixelIndex + Canvas.width * 4 + 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 4] -
                        RedDelta * DitherPattern[8]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 4 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 4 + 1] -
                        GreenDelta * DitherPattern[8]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 4 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 4 + 2] -
                        BlueDelta * DitherPattern[8]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[13]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 + 4] -
                        RedDelta * DitherPattern[13]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 1] -
                          GreenDelta * DitherPattern[13]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 2] -
                          BlueDelta * DitherPattern[13]
                      )
                    )
                  );
              }
            }

            if (Y < Canvas.height - 1 && DitherPattern[7]) {
              Data.data[PixelIndex + Canvas.width * 4] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 4] -
                      RedDelta * DitherPattern[7]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 4 + 1] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 4 + 1] -
                      GreenDelta * DitherPattern[7]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 4 + 2] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 4 + 2] -
                      BlueDelta * DitherPattern[7]
                  )
                )
              );
            }

            if (Y < Canvas.height - 2 && DitherPattern[12]) {
              Data.data[PixelIndex + Canvas.width * 2 * 4] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 2 * 4] -
                      RedDelta * DitherPattern[12]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 2 * 4 + 1] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 2 * 4 + 1] -
                      GreenDelta * DitherPattern[12]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 2 * 4 + 2] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 2 * 4 + 2] -
                      BlueDelta * DitherPattern[12]
                  )
                )
              );
            }

            if (X > 0) {
              if (Y < Canvas.height - 1 && DitherPattern[6]) {
                Data.data[PixelIndex + Canvas.width * 4 - 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 4] -
                        RedDelta * DitherPattern[6]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 4 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 4 + 1] -
                        GreenDelta * DitherPattern[6]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 4 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 4 + 2] -
                        BlueDelta * DitherPattern[6]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[11]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 - 4] -
                        RedDelta * DitherPattern[11]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 1] -
                          GreenDelta * DitherPattern[11]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 2] -
                          BlueDelta * DitherPattern[11]
                      )
                    )
                  );
              }
            }

            if (X > 1) {
              if (Y < Canvas.height - 1 && DitherPattern[5]) {
                Data.data[PixelIndex + Canvas.width * 4 - 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 8] -
                        RedDelta * DitherPattern[5]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 8 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 8 + 1] -
                        GreenDelta * DitherPattern[5]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 8 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 8 + 2] -
                        BlueDelta * DitherPattern[5]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[10]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 - 8] -
                        RedDelta * DitherPattern[10]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 1] -
                          GreenDelta * DitherPattern[10]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 2] -
                          BlueDelta * DitherPattern[10]
                      )
                    )
                  );
              }
            }
          }
        }

        Data.data[PixelIndex] = RemappedColor.Red;
        Data.data[PixelIndex + 1] = RemappedColor.Green;
        Data.data[PixelIndex + 2] = RemappedColor.Blue;
        Data.data[PixelIndex + 3] = 255;
      }
    }
  }

  Context.putImageData(Data, 0, 0);
}

function RemapNeochromeRasterImage2(
  Canvas,
  ImageInfos,
  BitsPerColor,
  DitherPattern
) {
  var WorkCanvas = document.createElement("canvas");

  WorkCanvas.width = Canvas.width + 2;
  WorkCanvas.height = Canvas.height + 2;

  var WorkContext = WorkCanvas.getContext("2d");

  WorkContext.drawImage(Canvas, 0, 0, Canvas.width, Canvas.height);

  var WorkImageData = WorkContext.getImageData(
    0,
    0,
    WorkCanvas.width,
    WorkCanvas.height
  );
  var WorkData = WorkImageData.data;

  var OriginalDitherPattern = [
    0,
    0,
    0,
    7.0 / 16.0,
    0,
    0,
    3.0 / 16.0,
    5.0 / 16.0,
    1.0 / 16.0,
    0,
    0,
    0,
    0,
    0,
    0,
  ];

  var ShadesPerColor = 1 << BitsPerColor;
  var ShadesScale = (ShadesPerColor - 1) / 255;
  var InverseShadesScale = 1 / ShadesScale;

  for (var Y = 0; Y < Canvas.height; Y++) {
    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * WorkCanvas.width) * 4;

      var Red = WorkData[PixelIndex];
      var Green = WorkData[PixelIndex + 1];
      var Blue = WorkData[PixelIndex + 2];
      var Alpha = WorkData[PixelIndex + 3];
      var Luminance = Red * 0.21 + Green * 0.72 + Blue * 0.07;

      if (Alpha == 255) {
        var NewRed = Math.round(
          Math.round(Red * ShadesScale) * InverseShadesScale
        );
        var NewGreen = Math.round(
          Math.round(Green * ShadesScale) * InverseShadesScale
        );
        var NewBlue = Math.round(
          Math.round(Blue * ShadesScale) * InverseShadesScale
        );

        if (OriginalDitherPattern) {
          var RedDelta = NewRed - Red;
          var GreenDelta = NewGreen - Green;
          var BlueDelta = NewBlue - Blue;

          WorkData[PixelIndex + 8] -= RedDelta * OriginalDitherPattern[4];
          WorkData[PixelIndex + 8 + 1] -= GreenDelta * OriginalDitherPattern[4];
          WorkData[PixelIndex + 8 + 2] -= BlueDelta * OriginalDitherPattern[4];

          WorkData[PixelIndex + WorkCanvas.width * 4 + 8] -=
            RedDelta * OriginalDitherPattern[9];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 8 + 1] -=
            GreenDelta * OriginalDitherPattern[9];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 8 + 2] -=
            BlueDelta * OriginalDitherPattern[9];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 8] -=
            RedDelta * OriginalDitherPattern[14];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 8 + 1] -=
            GreenDelta * OriginalDitherPattern[14];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 8 + 2] -=
            BlueDelta * OriginalDitherPattern[14];

          WorkData[PixelIndex + 4] -= RedDelta * OriginalDitherPattern[3];
          WorkData[PixelIndex + 4 + 1] -= GreenDelta * OriginalDitherPattern[3];
          WorkData[PixelIndex + 4 + 2] -= BlueDelta * OriginalDitherPattern[3];

          WorkData[PixelIndex + WorkCanvas.width * 4 + 4] -=
            RedDelta * OriginalDitherPattern[8];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 4 + 1] -=
            GreenDelta * OriginalDitherPattern[8];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 4 + 2] -=
            BlueDelta * OriginalDitherPattern[8];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 4] -=
            RedDelta * OriginalDitherPattern[13];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 4 + 1] -=
            GreenDelta * OriginalDitherPattern[13];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 4 + 2] -=
            BlueDelta * OriginalDitherPattern[13];

          WorkData[PixelIndex + WorkCanvas.width * 4] -=
            RedDelta * OriginalDitherPattern[7];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 1] -=
            GreenDelta * OriginalDitherPattern[7];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 2] -=
            BlueDelta * OriginalDitherPattern[7];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4] -=
            RedDelta * OriginalDitherPattern[12];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 1] -=
            GreenDelta * OriginalDitherPattern[12];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 2] -=
            BlueDelta * OriginalDitherPattern[12];

          WorkData[PixelIndex + WorkCanvas.width * 4 - 4] -=
            RedDelta * OriginalDitherPattern[6];
          WorkData[PixelIndex + WorkCanvas.width * 4 - 4 + 1] -=
            GreenDelta * OriginalDitherPattern[6];
          WorkData[PixelIndex + WorkCanvas.width * 4 - 4 + 2] -=
            BlueDelta * OriginalDitherPattern[6];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 4] -=
            RedDelta * OriginalDitherPattern[11];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 4 + 1] -=
            GreenDelta * OriginalDitherPattern[11];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 4 + 2] -=
            BlueDelta * OriginalDitherPattern[11];

          WorkData[PixelIndex + WorkCanvas.width * 4 - 8] -=
            RedDelta * OriginalDitherPattern[5];
          WorkData[PixelIndex + WorkCanvas.width * 4 - 8 + 1] -=
            GreenDelta * OriginalDitherPattern[5];
          WorkData[PixelIndex + WorkCanvas.width * 4 - 8 + 2] -=
            BlueDelta * OriginalDitherPattern[5];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 8] -=
            RedDelta * OriginalDitherPattern[10];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 8 + 1] -=
            GreenDelta * OriginalDitherPattern[10];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 8 + 2] -=
            BlueDelta * OriginalDitherPattern[10];
        }

        WorkData[PixelIndex] = NewRed;
        WorkData[PixelIndex + 1] = NewGreen;
        WorkData[PixelIndex + 2] = NewBlue;
        WorkData[PixelIndex + 3] = 255;
      }
    }
  }

  //WorkContext.putImageData(WorkImageData, 0, 0);

  // Spectrumize it.

  var Context = Canvas.getContext("2d");
  var ImageData = Context.getImageData(0, 0, Canvas.width, Canvas.height);
  var Data = ImageData.data;

  ImageInfos.LineColors = [];
  ImageInfos.ConvertedBitsPerColor = BitsPerColor;

  for (var Y = 0; Y < Canvas.height; Y++) {
    // Fill Spectrum 512/4k color slots.

    var ColorSlots = [];

    for (var ColorSlotIndex = 0; ColorSlotIndex < 16; ColorSlotIndex++) {
      var Red = 0;
      var Green = 0;
      var Blue = 0;

      var Count = 0;

      if (ColorSlotIndex == 0) Count = 100;

      ColorSlots.push({
        Red: Red,
        Green: Green,
        Blue: Blue,
        Count: Count,
        ColorSlotIndex: ColorSlotIndex,
      });
    }

    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * WorkCanvas.width) * 4;

      var Red = WorkData[PixelIndex];
      var Green = WorkData[PixelIndex + 1];
      var Blue = WorkData[PixelIndex + 2];
      var Alpha = WorkData[PixelIndex + 3];
      var Luminance = Red * 0.21 + Green * 0.72 + Blue * 0.07;

      if (Alpha == 255) {
        var Colors = [];

        Colors.push({ Red: Red, Green: Green, Blue: Blue, Count: 1 });

        var ColorIndex;

        for (ColorIndex = 0; ColorIndex < 16; ColorIndex++) {
          var SpectrumColor = ColorSlots[ColorIndex];

          if (
            SpectrumColor.Red == Red &&
            SpectrumColor.Green == Green &&
            SpectrumColor.Blue == Blue
          ) {
            SpectrumColor.Count++;

            break;
          }

          if (SpectrumColor.Count == 0) {
            SpectrumColor.Red = Red;
            SpectrumColor.Green = Green;
            SpectrumColor.Blue = Blue;

            SpectrumColor.Count = 1;

            break;
          }

          Colors.push(SpectrumColor);
        }

        if (ColorIndex == 16) {
          var LastDistance = Number.MAX_VALUE;
          var Color1;
          var Color2;

          for (var Index1 = 0; Index1 < Colors.length - 1; Index1++) {
            for (var Index2 = Index1 + 1; Index2 < Colors.length; Index2++) {
              let labColor1 = rgb2lab([
                Colors[Index1].Red,
                Colors[Index1].Green,
                Colors[Index1].Blue,
              ]);
              let labColor2 = rgb2lab([
                Colors[Index2].Red,
                Colors[Index2].Green,
                Colors[Index2].Blue,
              ]);
              let Distance = deltaE(labColor1, labColor2);

              var TotalCount =
                Colors[Index1].Count * Colors[Index1].Count +
                Colors[Index2].Count * Colors[Index2].Count;

              Distance *= Math.pow(TotalCount, 0.6);

              if (Distance < LastDistance) {
                LastDistance = Distance;

                Color1 = Colors[Index1];
                Color2 = Colors[Index2];
              }
            }
          }

          if (Color1 == Colors[0]) {
            Color2.Red =
              (Color1.Red * Color1.Count + Color2.Red * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Green =
              (Color1.Green * Color1.Count + Color2.Green * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Blue =
              (Color1.Blue * Color1.Count + Color2.Blue * Color2.Count) /
              (Color1.Count + Color2.Count);

            Color2.Count = Color1.Count + Color2.Count;
          } else {
            Color2.Red =
              (Color1.Red * Color1.Count + Color2.Red * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Green =
              (Color1.Green * Color1.Count + Color2.Green * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Blue =
              (Color1.Blue * Color1.Count + Color2.Blue * Color2.Count) /
              (Color1.Count + Color2.Count);

            Color2.Count = Color1.Count + Color2.Count;

            Color1.Red = Colors[0].Red;
            Color1.Green = Colors[0].Green;
            Color1.Blue = Colors[0].Blue;

            Color1.Count = Colors[0].Count;
          }
        }
      }
    }

    var SpectrumColors = [];

    for (var SlotIndex = 0; SlotIndex < 16; SlotIndex++) {
      ColorSlots[SlotIndex].Red = Math.round(
        Math.round(ColorSlots[SlotIndex].Red * ShadesScale) * InverseShadesScale
      );
      ColorSlots[SlotIndex].Green = Math.round(
        Math.round(ColorSlots[SlotIndex].Green * ShadesScale) *
          InverseShadesScale
      );
      ColorSlots[SlotIndex].Blue = Math.round(
        Math.round(ColorSlots[SlotIndex].Blue * ShadesScale) *
          InverseShadesScale
      );

      SpectrumColors.push({
        Red: ColorSlots[SlotIndex].Red,
        Green: ColorSlots[SlotIndex].Green,
        Blue: ColorSlots[SlotIndex].Blue,
      });
    }

    SpectrumColors.sort(function (Color1, Color2) {
      return (
        SrgbToRgb(Color1.Red) * 0.21 +
        SrgbToRgb(Color1.Green) * 0.72 +
        SrgbToRgb(Color1.Blue) * 0.07 -
        (SrgbToRgb(Color2.Red) * 0.21 +
          SrgbToRgb(Color2.Green) * 0.72 +
          SrgbToRgb(Color2.Blue) * 0.07)
      );
    });

    ImageInfos.LineColors.push(SpectrumColors);

    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * WorkCanvas.width) * 4;
      var DisplayPixelIndex = (X + Y * Canvas.width) * 4;

      var Red = WorkData[PixelIndex];
      var Green = WorkData[PixelIndex + 1];
      var Blue = WorkData[PixelIndex + 2];
      var Alpha = WorkData[PixelIndex + 3];
      var Luminance =
        SrgbToRgb(Red) * 0.35 + SrgbToRgb(Green) * 0.55 + SrgbToRgb(Blue) * 0.1;

      if (Alpha == 255) {
        // Find the matching color index.

        var LastDistance = Number.MAX_VALUE;
        var RemappedColor = {};
        var SpectrumColor = {};

        for (var ColorIndex = 0; ColorIndex < 16; ColorIndex++) {
          SpectrumColor.Red = ColorSlots[ColorIndex].Red;
          SpectrumColor.Green = ColorSlots[ColorIndex].Green;
          SpectrumColor.Blue = ColorSlots[ColorIndex].Blue;

          var RedDelta = SpectrumColor.Red - Red;
          var GreenDelta = SpectrumColor.Green - Green;
          var BlueDelta = SpectrumColor.Blue - Blue;

          var Luminance2 =
            SrgbToRgb(SpectrumColor.Red) * 0.35 +
            SrgbToRgb(SpectrumColor.Green) * 0.55 +
            SrgbToRgb(SpectrumColor.Blue) * 0.1;
          var LuminanceDelta = Luminance2 - Luminance;

          var Distance = ColorDistance(
            RedDelta,
            GreenDelta,
            BlueDelta,
            LuminanceDelta
          );

          if (Distance < LastDistance) {
            RemappedColor.Red = SpectrumColor.Red;
            RemappedColor.Green = SpectrumColor.Green;
            RemappedColor.Blue = SpectrumColor.Blue;

            LastDistance = Distance;
          }
        }

        if (DitherPattern) {
          var RedDelta = RemappedColor.Red - Red;
          var GreenDelta = RemappedColor.Green - Green;
          var BlueDelta = RemappedColor.Blue - Blue;

          WorkData[PixelIndex + 8] -= RedDelta * DitherPattern[4];
          WorkData[PixelIndex + 8 + 1] -= GreenDelta * DitherPattern[4];
          WorkData[PixelIndex + 8 + 2] -= BlueDelta * DitherPattern[4];

          WorkData[PixelIndex + WorkCanvas.width * 4 + 8] -=
            RedDelta * DitherPattern[9];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 8 + 1] -=
            GreenDelta * DitherPattern[9];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 8 + 2] -=
            BlueDelta * DitherPattern[9];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 8] -=
            RedDelta * DitherPattern[14];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 8 + 1] -=
            GreenDelta * DitherPattern[14];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 8 + 2] -=
            BlueDelta * DitherPattern[14];

          WorkData[PixelIndex + 4] -= RedDelta * DitherPattern[3];
          WorkData[PixelIndex + 4 + 1] -= GreenDelta * DitherPattern[3];
          WorkData[PixelIndex + 4 + 2] -= BlueDelta * DitherPattern[3];

          WorkData[PixelIndex + WorkCanvas.width * 4 + 4] -=
            RedDelta * DitherPattern[8];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 4 + 1] -=
            GreenDelta * DitherPattern[8];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 4 + 2] -=
            BlueDelta * DitherPattern[8];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 4] -=
            RedDelta * DitherPattern[13];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 4 + 1] -=
            GreenDelta * DitherPattern[13];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 4 + 2] -=
            BlueDelta * DitherPattern[13];

          WorkData[PixelIndex + WorkCanvas.width * 4] -=
            RedDelta * DitherPattern[7];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 1] -=
            GreenDelta * DitherPattern[7];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 2] -=
            BlueDelta * DitherPattern[7];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4] -=
            RedDelta * DitherPattern[12];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 1] -=
            GreenDelta * DitherPattern[12];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 2] -=
            BlueDelta * DitherPattern[12];

          WorkData[PixelIndex + WorkCanvas.width * 4 - 4] -=
            RedDelta * DitherPattern[6];
          WorkData[PixelIndex + WorkCanvas.width * 4 - 4 + 1] -=
            GreenDelta * DitherPattern[6];
          WorkData[PixelIndex + WorkCanvas.width * 4 - 4 + 2] -=
            BlueDelta * DitherPattern[6];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 4] -=
            RedDelta * DitherPattern[11];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 4 + 1] -=
            GreenDelta * DitherPattern[11];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 4 + 2] -=
            BlueDelta * DitherPattern[11];

          WorkData[PixelIndex + WorkCanvas.width * 4 - 8] -=
            RedDelta * DitherPattern[5];
          WorkData[PixelIndex + WorkCanvas.width * 4 - 8 + 1] -=
            GreenDelta * DitherPattern[5];
          WorkData[PixelIndex + WorkCanvas.width * 4 - 8 + 2] -=
            BlueDelta * DitherPattern[5];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 8] -=
            RedDelta * DitherPattern[10];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 8 + 1] -=
            GreenDelta * DitherPattern[10];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 8 + 2] -=
            BlueDelta * DitherPattern[10];
        }

        Data[DisplayPixelIndex] = RemappedColor.Red;
        Data[DisplayPixelIndex + 1] = RemappedColor.Green;
        Data[DisplayPixelIndex + 2] = RemappedColor.Blue;
        Data[DisplayPixelIndex + 3] = 255;
      }
    }
  }

  Context.putImageData(ImageData, 0, 0);
}

function GetColorSlotIndex(X, ColorIndex) {
  var Temp = 10 * ColorIndex;

  if (ColorIndex & 1) Temp -= 5;
  else Temp++;

  if (X < Temp) return ColorIndex;

  if (X >= Temp + 160) return ColorIndex + 32;

  return ColorIndex + 16;
}

function ColorDistance(RedDelta, GreenDelta, BlueDelta, LuminanceDelta) {
  return (
    RedDelta * RedDelta +
    GreenDelta * GreenDelta +
    BlueDelta * BlueDelta +
    LuminanceDelta * LuminanceDelta * 6
  );
  //return RedDelta * RedDelta * 0.3 + GreenDelta * GreenDelta * 0.6 + BlueDelta * BlueDelta * 0.1 + LuminanceDelta * LuminanceDelta * 2;
  //return RedDelta * RedDelta * 0.3 + GreenDelta * GreenDelta * 0.5 + BlueDelta * BlueDelta * 0.2 + LuminanceDelta * LuminanceDelta * 5;

  //return RedDelta * RedDelta * 0.21 + GreenDelta * GreenDelta * 0.72 + BlueDelta * BlueDelta * 0.07 + LuminanceDelta * LuminanceDelta;
}

function RemapSpectrum512Image(
  Canvas,
  ImageInfos,
  BitsPerColor,
  DitherPattern
) {
  var ShadesPerColor = 1 << BitsPerColor;
  var ShadesScale = (ShadesPerColor - 1) / 255;
  var InverseShadesScale = 1 / ShadesScale;

  ImageInfos.SpectrumPalettes = [];
  ImageInfos.ConvertedBitsPerColor = BitsPerColor;

  var OriginalCanvas = document.createElement("canvas");

  OriginalCanvas.width = Canvas.width;
  OriginalCanvas.height = Canvas.height;

  var OriginalContext = OriginalCanvas.getContext("2d");

  OriginalContext.drawImage(Canvas, 0, 0, Canvas.width, Canvas.height);

  var OriginalData = OriginalContext.getImageData(
    0,
    0,
    OriginalCanvas.width,
    OriginalCanvas.height
  );

  var Context = Canvas.getContext("2d");
  var Data = Context.getImageData(0, 0, Canvas.width, Canvas.height);

  for (var Y = 0; Y < Canvas.height; Y++) {
    // Fill Spectrum 512/4k color slots.

    var ColorSlots = [];

    for (var ColorSlotIndex = 0; ColorSlotIndex < 48; ColorSlotIndex++) {
      var Red = 0;
      var Green = 0;
      var Blue = 0;

      var Count = 0;

      //if(ColorSlotIndex == 0 || ColorSlotIndex == 16 || ColorSlotIndex == 32)
      if (ColorSlotIndex == 0) {
        Count = 100000;
      }
      /*
      else if(ColorSlotIndex == 15 || ColorSlotIndex == (16 + 15) || ColorSlotIndex == (32 + 15))
      {
        Red = 255;
        Green = 255;
        Blue = 255;

        Count = 1;
      }
      */
      ColorSlots.push({ Red: Red, Green: Green, Blue: Blue, Count: Count });
    }

    var LineColorCounts = {};

    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * Canvas.width) * 4;

      var Red = OriginalData.data[PixelIndex];
      var Green = OriginalData.data[PixelIndex + 1];
      var Blue = OriginalData.data[PixelIndex + 2];
      var Alpha = OriginalData.data[PixelIndex + 3];
      var Luminance = Red * 0.21 + Green * 0.72 + Blue * 0.07;

      if (Alpha == 255) {
        //Red = Math.round(Red * ShadesScale) * InverseShadesScale;
        //Green = Math.round(Green * ShadesScale) * InverseShadesScale;
        //Blue = Math.round(Blue * ShadesScale) * InverseShadesScale;

        var LineColorIndex = (Red << 16) | (Green << 8) | Blue;

        if (LineColorCounts[LineColorIndex]) LineColorCounts[LineColorIndex]++;
        else LineColorCounts[LineColorIndex] = 1;

        var Colors = [];

        Colors.push({
          Red: Red,
          Green: Green,
          Blue: Blue,
          Count: LineColorCounts[LineColorIndex],
        });

        var ColorIndex;

        for (ColorIndex = 0; ColorIndex < 16; ColorIndex++) {
          var SpectrumColor = ColorSlots[GetColorSlotIndex(X, ColorIndex)];

          if (
            SpectrumColor.Red == Red &&
            SpectrumColor.Green == Green &&
            SpectrumColor.Blue == Blue
          ) {
            SpectrumColor.Count++;

            break;
          }

          if (SpectrumColor.Count == 0) {
            SpectrumColor.Red = Red;
            SpectrumColor.Green = Green;
            SpectrumColor.Blue = Blue;

            SpectrumColor.Count = LineColorCounts[LineColorIndex];

            break;
          }

          SpectrumColor.ColorSlot = GetColorSlotIndex(X, ColorIndex);

          Colors.push(SpectrumColor);
        }

        if (ColorIndex == 16) {
          var LastDistance = Number.MAX_VALUE;
          var Color1;
          var Color2;

          for (var Index1 = 0; Index1 < Colors.length - 1; Index1++) {
            for (var Index2 = Index1 + 1; Index2 < Colors.length; Index2++) {
              var Red1 = Math.round(
                Math.round(Colors[Index1].Red * ShadesScale) *
                  InverseShadesScale
              );
              var Green1 = Math.round(
                Math.round(Colors[Index1].Green * ShadesScale) *
                  InverseShadesScale
              );
              var Blue1 = Math.round(
                Math.round(Colors[Index1].Blue * ShadesScale) *
                  InverseShadesScale
              );

              var Red2 = Math.round(
                Math.round(Colors[Index2].Red * ShadesScale) *
                  InverseShadesScale
              );
              var Green2 = Math.round(
                Math.round(Colors[Index2].Green * ShadesScale) *
                  InverseShadesScale
              );
              var Blue2 = Math.round(
                Math.round(Colors[Index2].Blue * ShadesScale) *
                  InverseShadesScale
              );

              var Luminance1 = Red1 * 0.21 + Green1 * 0.72 + Blue1 * 0.07;
              var Luminance2 = Red2 * 0.21 + Green2 * 0.72 + Blue2 * 0.07;

              var RedDelta = Red1 - Red2;
              var GreenDelta = Green1 - Green2;
              var BlueDelta = Blue1 - Blue2;

              var LuminanceDelta = Luminance2 - Luminance1;

              var Distance = ColorDistance(
                RedDelta,
                GreenDelta,
                BlueDelta,
                LuminanceDelta
              );

              if (Distance < LastDistance) {
                LastDistance = Distance;

                Color1 = Colors[Index1];
                Color2 = Colors[Index2];
              }
            }
          }

          if (Color1 == Colors[0]) {
            Color2.Red =
              (Color1.Red * Color1.Count + Color2.Red * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Green =
              (Color1.Green * Color1.Count + Color2.Green * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Blue =
              (Color1.Blue * Color1.Count + Color2.Blue * Color2.Count) /
              (Color1.Count + Color2.Count);

            Color2.Count = Color1.Count + Color2.Count;
          } else if (Color1.ColorSlot < Color2.ColorSlot) {
            Color1.Red =
              (Color1.Red * Color1.Count + Color2.Red * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color1.Green =
              (Color1.Green * Color1.Count + Color2.Green * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color1.Blue =
              (Color1.Blue * Color1.Count + Color2.Blue * Color2.Count) /
              (Color1.Count + Color2.Count);

            Color1.Count = Color1.Count + Color2.Count;

            Color2.Red = Colors[0].Red;
            Color2.Green = Colors[0].Green;
            Color2.Blue = Colors[0].Blue;

            Color2.Count = Colors[0].Count;
          } else {
            Color2.Red =
              (Color1.Red * Color1.Count + Color2.Red * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Green =
              (Color1.Green * Color1.Count + Color2.Green * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Blue =
              (Color1.Blue * Color1.Count + Color2.Blue * Color2.Count) /
              (Color1.Count + Color2.Count);

            Color2.Count = Color1.Count + Color2.Count;

            Color1.Red = Colors[0].Red;
            Color1.Green = Colors[0].Green;
            Color1.Blue = Colors[0].Blue;

            Color1.Count = Colors[0].Count;
          }
        }

        // Find the matching color index.

        var LastDistance = Number.MAX_VALUE;
        var RemappedColor = {};
        var SpectrumColor = {};

        for (var ColorIndex = 0; ColorIndex < 16; ColorIndex++) {
          SpectrumColor.Red = ColorSlots[GetColorSlotIndex(X, ColorIndex)].Red;
          SpectrumColor.Green =
            ColorSlots[GetColorSlotIndex(X, ColorIndex)].Green;
          SpectrumColor.Blue =
            ColorSlots[GetColorSlotIndex(X, ColorIndex)].Blue;
          SpectrumColor.Count =
            ColorSlots[GetColorSlotIndex(X, ColorIndex)].Count;

          if (SpectrumColor.Count > 0) {
            SpectrumColor.Red = Math.round(
              Math.round(SpectrumColor.Red * ShadesScale) * InverseShadesScale
            );
            SpectrumColor.Green = Math.round(
              Math.round(SpectrumColor.Green * ShadesScale) * InverseShadesScale
            );
            SpectrumColor.Blue = Math.round(
              Math.round(SpectrumColor.Blue * ShadesScale) * InverseShadesScale
            );

            var RedDelta = SpectrumColor.Red - Red;
            var GreenDelta = SpectrumColor.Green - Green;
            var BlueDelta = SpectrumColor.Blue - Blue;

            var Luminance2 =
              SpectrumColor.Red * 0.21 +
              SpectrumColor.Green * 0.72 +
              SpectrumColor.Blue * 0.07;
            var LuminanceDelta = Luminance2 - Luminance;

            var Distance = ColorDistance(
              RedDelta,
              GreenDelta,
              BlueDelta,
              LuminanceDelta
            );

            if (Distance < LastDistance) {
              RemappedColor.Red = SpectrumColor.Red;
              RemappedColor.Green = SpectrumColor.Green;
              RemappedColor.Blue = SpectrumColor.Blue;

              LastDistance = Distance;
            }
          }
        }

        for (var ColorSlotIndex = 0; ColorSlotIndex < 48; ColorSlotIndex++) {
          if (ColorSlots[ColorSlotIndex].Red != -1) {
            ColorSlots[ColorSlotIndex].Red = Math.round(
              Math.round(ColorSlots[ColorSlotIndex].Red * ShadesScale) *
                InverseShadesScale
            );
            ColorSlots[ColorSlotIndex].Green = Math.round(
              Math.round(ColorSlots[ColorSlotIndex].Green * ShadesScale) *
                InverseShadesScale
            );
            ColorSlots[ColorSlotIndex].Blue = Math.round(
              Math.round(ColorSlots[ColorSlotIndex].Blue * ShadesScale) *
                InverseShadesScale
            );
          }
        }

        // Error distribution for the following pixels in this line.

        var RedDelta = RemappedColor.Red - OriginalData.data[PixelIndex];
        var GreenDelta =
          RemappedColor.Green - OriginalData.data[PixelIndex + 1];
        var BlueDelta = RemappedColor.Blue - OriginalData.data[PixelIndex + 2];

        var Distribution1 = 0.6;
        var Distribution2 = 0.3;
        var Distribution3 = 0.1;
        var Intensity = 0.87;

        if (X < Canvas.width - 1) {
          OriginalData.data[PixelIndex + 4] = Math.round(
            Math.min(
              255,
              Math.max(
                0,
                OriginalData.data[PixelIndex + 4] -
                  RedDelta * Distribution1 * Intensity
              )
            )
          );
          OriginalData.data[PixelIndex + 4 + 1] = Math.round(
            Math.min(
              255,
              Math.max(
                0,
                OriginalData.data[PixelIndex + 4 + 1] -
                  GreenDelta * Distribution1 * Intensity
              )
            )
          );
          OriginalData.data[PixelIndex + 4 + 2] = Math.round(
            Math.min(
              255,
              Math.max(
                0,
                OriginalData.data[PixelIndex + 4 + 2] -
                  BlueDelta * Distribution1 * Intensity
              )
            )
          );
        }

        if (X < Canvas.width - 2) {
          OriginalData.data[PixelIndex + 4 * 2] = Math.round(
            Math.min(
              255,
              Math.max(
                0,
                OriginalData.data[PixelIndex + 4 * 2] -
                  RedDelta * Distribution2 * Intensity
              )
            )
          );
          OriginalData.data[PixelIndex + 4 * 2 + 1] = Math.round(
            Math.min(
              255,
              Math.max(
                0,
                OriginalData.data[PixelIndex + 4 * 2 + 1] -
                  GreenDelta * Distribution2 * Intensity
              )
            )
          );
          OriginalData.data[PixelIndex + 4 * 2 + 2] = Math.round(
            Math.min(
              255,
              Math.max(
                0,
                OriginalData.data[PixelIndex + 4 * 2 + 2] -
                  BlueDelta * Distribution2 * Intensity
              )
            )
          );
        }

        if (X < Canvas.width - 3) {
          OriginalData.data[PixelIndex + 4 * 3] = Math.round(
            Math.min(
              255,
              Math.max(
                0,
                OriginalData.data[PixelIndex + 4 * 3] -
                  RedDelta * Distribution3 * Intensity
              )
            )
          );
          OriginalData.data[PixelIndex + 4 * 3 + 1] = Math.round(
            Math.min(
              255,
              Math.max(
                0,
                OriginalData.data[PixelIndex + 4 * 3 + 1] -
                  GreenDelta * Distribution3 * Intensity
              )
            )
          );
          OriginalData.data[PixelIndex + 4 * 3 + 2] = Math.round(
            Math.min(
              255,
              Math.max(
                0,
                OriginalData.data[PixelIndex + 4 * 3 + 2] -
                  BlueDelta * Distribution3 * Intensity
              )
            )
          );
        }
        /*
        var RedDelta = RemappedColor.Red - OriginalData.data[PixelIndex];
        var GreenDelta = RemappedColor.Green - OriginalData.data[PixelIndex + 1];
        var BlueDelta = RemappedColor.Blue - OriginalData.data[PixelIndex + 2];

        if(X < Canvas.width - 1)
        {
          OriginalData.data[PixelIndex + 4] = Math.round(Math.min(255, Math.max(0, OriginalData.data[PixelIndex + 4] - RedDelta)));
          OriginalData.data[PixelIndex + 4 + 1] = Math.round(Math.min(255, Math.max(0, OriginalData.data[PixelIndex + 4 + 1] - GreenDelta)));
          OriginalData.data[PixelIndex + 4 + 2] = Math.round(Math.min(255, Math.max(0, OriginalData.data[PixelIndex + 4 + 2] - BlueDelta)));
        }
*/
      }
    }

    var SpectrumColors = [];

    for (var SlotIndex = 0; SlotIndex < 48; SlotIndex++)
      SpectrumColors.push({
        Red: ColorSlots[SlotIndex].Red,
        Green: ColorSlots[SlotIndex].Green,
        Blue: ColorSlots[SlotIndex].Blue,
      });

    ImageInfos.SpectrumPalettes.push(SpectrumColors);

    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * Canvas.width) * 4;

      var Red = Data.data[PixelIndex];
      var Green = Data.data[PixelIndex + 1];
      var Blue = Data.data[PixelIndex + 2];
      var Alpha = Data.data[PixelIndex + 3];
      var Luminance = Red * 0.21 + Green * 0.72 + Blue * 0.07;

      if (Alpha == 255) {
        // Find the matching color index.

        var LastDistance = Number.MAX_VALUE;
        var RemappedColor = {};
        var SpectrumColor = {};

        for (var ColorIndex = 0; ColorIndex < 16; ColorIndex++) {
          SpectrumColor.Red = ColorSlots[GetColorSlotIndex(X, ColorIndex)].Red;
          SpectrumColor.Green =
            ColorSlots[GetColorSlotIndex(X, ColorIndex)].Green;
          SpectrumColor.Blue =
            ColorSlots[GetColorSlotIndex(X, ColorIndex)].Blue;

          SpectrumColor.Red = Math.round(
            Math.round(SpectrumColor.Red * ShadesScale) * InverseShadesScale
          );
          SpectrumColor.Green = Math.round(
            Math.round(SpectrumColor.Green * ShadesScale) * InverseShadesScale
          );
          SpectrumColor.Blue = Math.round(
            Math.round(SpectrumColor.Blue * ShadesScale) * InverseShadesScale
          );

          var RedDelta = SpectrumColor.Red - Red;
          var GreenDelta = SpectrumColor.Green - Green;
          var BlueDelta = SpectrumColor.Blue - Blue;

          var Luminance2 =
            SpectrumColor.Red * 0.21 +
            SpectrumColor.Green * 0.72 +
            SpectrumColor.Blue * 0.07;
          var LuminanceDelta = Luminance2 - Luminance;

          var Distance = ColorDistance(
            RedDelta,
            GreenDelta,
            BlueDelta,
            LuminanceDelta
          );

          if (Distance < LastDistance) {
            RemappedColor.Red = SpectrumColor.Red;
            RemappedColor.Green = SpectrumColor.Green;
            RemappedColor.Blue = SpectrumColor.Blue;

            LastDistance = Distance;
          }
        }

        if (DitherPattern) {
          {
            var RedDelta = RemappedColor.Red - Red;
            var GreenDelta = RemappedColor.Green - Green;
            var BlueDelta = RemappedColor.Blue - Blue;

            if (X < Canvas.width - 2) {
              if (DitherPattern[4]) {
                Data.data[PixelIndex + 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 8] - RedDelta * DitherPattern[4]
                    )
                  )
                );
                Data.data[PixelIndex + 8 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 8 + 1] -
                        GreenDelta * DitherPattern[4]
                    )
                  )
                );
                Data.data[PixelIndex + 8 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 8 + 2] -
                        BlueDelta * DitherPattern[4]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 1 && DitherPattern[9]) {
                Data.data[PixelIndex + Canvas.width * 4 + 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 8] -
                        RedDelta * DitherPattern[9]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 8 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 8 + 1] -
                        GreenDelta * DitherPattern[9]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 8 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 8 + 2] -
                        BlueDelta * DitherPattern[9]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[14]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 + 8] -
                        RedDelta * DitherPattern[14]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 1] -
                          GreenDelta * DitherPattern[14]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 2] -
                          BlueDelta * DitherPattern[14]
                      )
                    )
                  );
              }
            }

            if (X < Canvas.width - 1) {
              if (DitherPattern[3]) {
                Data.data[PixelIndex + 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 4] - RedDelta * DitherPattern[3]
                    )
                  )
                );
                Data.data[PixelIndex + 4 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 4 + 1] -
                        GreenDelta * DitherPattern[3]
                    )
                  )
                );
                Data.data[PixelIndex + 4 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 4 + 2] -
                        BlueDelta * DitherPattern[3]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 1 && DitherPattern[8]) {
                Data.data[PixelIndex + Canvas.width * 4 + 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 4] -
                        RedDelta * DitherPattern[8]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 4 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 4 + 1] -
                        GreenDelta * DitherPattern[8]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 4 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 4 + 2] -
                        BlueDelta * DitherPattern[8]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[13]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 + 4] -
                        RedDelta * DitherPattern[13]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 1] -
                          GreenDelta * DitherPattern[13]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 2] -
                          BlueDelta * DitherPattern[13]
                      )
                    )
                  );
              }
            }

            if (Y < Canvas.height - 1 && DitherPattern[7]) {
              Data.data[PixelIndex + Canvas.width * 4] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 4] -
                      RedDelta * DitherPattern[7]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 4 + 1] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 4 + 1] -
                      GreenDelta * DitherPattern[7]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 4 + 2] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 4 + 2] -
                      BlueDelta * DitherPattern[7]
                  )
                )
              );
            }

            if (Y < Canvas.height - 2 && DitherPattern[12]) {
              Data.data[PixelIndex + Canvas.width * 2 * 4] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 2 * 4] -
                      RedDelta * DitherPattern[12]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 2 * 4 + 1] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 2 * 4 + 1] -
                      GreenDelta * DitherPattern[12]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 2 * 4 + 2] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 2 * 4 + 2] -
                      BlueDelta * DitherPattern[12]
                  )
                )
              );
            }

            if (X > 0) {
              if (Y < Canvas.height - 1 && DitherPattern[6]) {
                Data.data[PixelIndex + Canvas.width * 4 - 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 4] -
                        RedDelta * DitherPattern[6]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 4 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 4 + 1] -
                        GreenDelta * DitherPattern[6]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 4 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 4 + 2] -
                        BlueDelta * DitherPattern[6]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[11]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 - 4] -
                        RedDelta * DitherPattern[11]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 1] -
                          GreenDelta * DitherPattern[11]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 2] -
                          BlueDelta * DitherPattern[11]
                      )
                    )
                  );
              }
            }

            if (X > 1) {
              if (Y < Canvas.height - 1 && DitherPattern[5]) {
                Data.data[PixelIndex + Canvas.width * 4 - 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 8] -
                        RedDelta * DitherPattern[5]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 8 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 8 + 1] -
                        GreenDelta * DitherPattern[5]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 8 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 8 + 2] -
                        BlueDelta * DitherPattern[5]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[10]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 - 8] -
                        RedDelta * DitherPattern[10]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 1] -
                          GreenDelta * DitherPattern[10]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 2] -
                          BlueDelta * DitherPattern[10]
                      )
                    )
                  );
              }
            }
          }
        }

        Data.data[PixelIndex] = RemappedColor.Red;
        Data.data[PixelIndex + 1] = RemappedColor.Green;
        Data.data[PixelIndex + 2] = RemappedColor.Blue;
        Data.data[PixelIndex + 3] = 255;
      }
    }
  }

  Context.putImageData(Data, 0, 0);
}

function RemapSpectrum512Image2(
  Canvas,
  ImageInfos,
  BitsPerColor,
  DitherPattern
) {
  var BayerPattern2x2 = [
    [1 / 5, 3 / 5],
    [4 / 5, 2 / 5],
  ];

  var BayerPattern8x8 = [
    [0 / 65, 32 / 65, 8 / 65, 40 / 65, 2 / 65, 34 / 65, 10 / 65, 42 / 65],
    [48 / 65, 16 / 65, 56 / 65, 24 / 65, 50 / 65, 18 / 65, 58 / 65, 26 / 65],
    [12 / 65, 44 / 65, 4 / 65, 36 / 65, 14 / 65, 46 / 65, 6 / 65, 38 / 65],
    [60 / 65, 28 / 65, 52 / 65, 20 / 65, 62 / 65, 30 / 65, 54 / 65, 22 / 65],
    [3 / 65, 35 / 65, 11 / 65, 43 / 65, 1 / 65, 33 / 65, 9 / 65, 41 / 65],
    [51 / 65, 19 / 65, 59 / 65, 27 / 65, 49 / 65, 17 / 65, 57 / 65, 25 / 65],
    [15 / 65, 47 / 65, 7 / 65, 39 / 65, 13 / 65, 45 / 65, 5 / 65, 37 / 65],
    [63 / 65, 31 / 65, 55 / 65, 23 / 65, 61 / 65, 29 / 65, 53 / 65, 21 / 65],
  ];

  var ShadesPerColor = 1 << BitsPerColor;
  var ShadesScale = (ShadesPerColor - 1) / 255;
  var InverseShadesScale = 1 / ShadesScale;

  var Context = Canvas.getContext("2d");
  var Data = Context.getImageData(0, 0, Canvas.width, Canvas.height);

  for (var Y = 0; Y < Canvas.height; Y++) {
    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * Canvas.width) * 4;

      var Red = Data.data[PixelIndex];
      var Green = Data.data[PixelIndex + 1];
      var Blue = Data.data[PixelIndex + 2];
      var Alpha = Data.data[PixelIndex + 3];
      var Luminance = Red * 0.21 + Green * 0.72 + Blue * 0.07;

      if (Alpha == 255) {
        Red = Math.round(
          Math.min(
            255,
            Math.max(
              0,
              Red + BayerPattern8x8[X % 8][Y % 8] * InverseShadesScale
            )
          )
        );
        Green = Math.round(
          Math.min(
            255,
            Math.max(
              0,
              Green + BayerPattern8x8[X % 8][Y % 8] * InverseShadesScale
            )
          )
        );
        Blue = Math.round(
          Math.min(
            255,
            Math.max(
              0,
              Blue + BayerPattern8x8[X % 8][Y % 8] * InverseShadesScale
            )
          )
        );

        Red = Math.round(Red * ShadesScale) * InverseShadesScale;
        Green = Math.round(Green * ShadesScale) * InverseShadesScale;
        Blue = Math.round(Blue * ShadesScale) * InverseShadesScale;

        Data.data[PixelIndex] = Red;
        Data.data[PixelIndex + 1] = Green;
        Data.data[PixelIndex + 2] = Blue;
        Data.data[PixelIndex + 3] = 255;
      }
    }
  }

  Context.putImageData(Data, 0, 0);

  // Spectrumize it.

  ImageInfos.SpectrumPalettes = [];
  ImageInfos.ConvertedBitsPerColor = BitsPerColor;

  for (var Y = 0; Y < Canvas.height; Y++) {
    // Fill Spectrum 512/4k color slots.

    var ColorSlots = [];

    for (var ColorSlotIndex = 0; ColorSlotIndex < 48; ColorSlotIndex++) {
      var Red = 0;
      var Green = 0;
      var Blue = 0;

      var Count = 0;

      //if(ColorSlotIndex == 0 || ColorSlotIndex == 16 || ColorSlotIndex == 32)
      if (ColorSlotIndex == 0) {
        Count = 100000;
      }
      /*
      else if(ColorSlotIndex == 15 || ColorSlotIndex == (16 + 15) || ColorSlotIndex == (32 + 15))
      {
        Red = 255;
        Green = 255;
        Blue = 255;

        Count = 1;
      }
      */
      ColorSlots.push({ Red: Red, Green: Green, Blue: Blue, Count: Count });
    }

    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * Canvas.width) * 4;

      var Red = Data.data[PixelIndex];
      var Green = Data.data[PixelIndex + 1];
      var Blue = Data.data[PixelIndex + 2];
      var Alpha = Data.data[PixelIndex + 3];
      var Luminance = Red * 0.21 + Green * 0.72 + Blue * 0.07;

      if (Alpha == 255) {
        var Colors = [];

        Colors.push({ Red: Red, Green: Green, Blue: Blue, Count: 1 });

        var ColorIndex;

        for (ColorIndex = 0; ColorIndex < 16; ColorIndex++) {
          var SpectrumColor = ColorSlots[GetColorSlotIndex(X, ColorIndex)];

          if (
            SpectrumColor.Red == Red &&
            SpectrumColor.Green == Green &&
            SpectrumColor.Blue == Blue
          ) {
            SpectrumColor.Count++;

            break;
          }

          if (SpectrumColor.Count == 0) {
            SpectrumColor.Red = Red;
            SpectrumColor.Green = Green;
            SpectrumColor.Blue = Blue;

            SpectrumColor.Count = 1;

            break;
          }

          SpectrumColor.ColorSlot = GetColorSlotIndex(X, ColorIndex);

          Colors.push(SpectrumColor);
        }

        if (ColorIndex == 16) {
          var LastDistance = Number.MAX_VALUE;
          var Color1;
          var Color2;

          for (var Index1 = 0; Index1 < Colors.length - 1; Index1++) {
            for (var Index2 = Index1 + 1; Index2 < Colors.length; Index2++) {
              var Red1 = Math.round(
                Math.round(Colors[Index1].Red * ShadesScale) *
                  InverseShadesScale
              );
              var Green1 = Math.round(
                Math.round(Colors[Index1].Green * ShadesScale) *
                  InverseShadesScale
              );
              var Blue1 = Math.round(
                Math.round(Colors[Index1].Blue * ShadesScale) *
                  InverseShadesScale
              );

              var Red2 = Math.round(
                Math.round(Colors[Index2].Red * ShadesScale) *
                  InverseShadesScale
              );
              var Green2 = Math.round(
                Math.round(Colors[Index2].Green * ShadesScale) *
                  InverseShadesScale
              );
              var Blue2 = Math.round(
                Math.round(Colors[Index2].Blue * ShadesScale) *
                  InverseShadesScale
              );

              var Luminance1 = Red1 * 0.21 + Green1 * 0.72 + Blue1 * 0.07;
              var Luminance2 = Red2 * 0.21 + Green2 * 0.72 + Blue2 * 0.07;

              var RedDelta = Red1 - Red2;
              var GreenDelta = Green1 - Green2;
              var BlueDelta = Blue1 - Blue2;

              var LuminanceDelta = Luminance2 - Luminance1;

              var Distance = ColorDistance(
                RedDelta,
                GreenDelta,
                BlueDelta,
                LuminanceDelta
              );

              if (Distance < LastDistance) {
                LastDistance = Distance;

                Color1 = Colors[Index1];
                Color2 = Colors[Index2];
              }
            }
          }

          if (Color1 == Colors[0]) {
            Color2.Red =
              (Color1.Red * Color1.Count + Color2.Red * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Green =
              (Color1.Green * Color1.Count + Color2.Green * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Blue =
              (Color1.Blue * Color1.Count + Color2.Blue * Color2.Count) /
              (Color1.Count + Color2.Count);

            Color2.Count = Color1.Count + Color2.Count;
          } else if (Color1.ColorSlot < Color2.ColorSlot) {
            Color1.Red =
              (Color1.Red * Color1.Count + Color2.Red * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color1.Green =
              (Color1.Green * Color1.Count + Color2.Green * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color1.Blue =
              (Color1.Blue * Color1.Count + Color2.Blue * Color2.Count) /
              (Color1.Count + Color2.Count);

            Color1.Count = Color1.Count + Color2.Count;

            Color2.Red = Colors[0].Red;
            Color2.Green = Colors[0].Green;
            Color2.Blue = Colors[0].Blue;

            Color2.Count = Colors[0].Count;
          } else {
            Color2.Red =
              (Color1.Red * Color1.Count + Color2.Red * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Green =
              (Color1.Green * Color1.Count + Color2.Green * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Blue =
              (Color1.Blue * Color1.Count + Color2.Blue * Color2.Count) /
              (Color1.Count + Color2.Count);

            Color2.Count = Color1.Count + Color2.Count;

            Color1.Red = Colors[0].Red;
            Color1.Green = Colors[0].Green;
            Color1.Blue = Colors[0].Blue;

            Color1.Count = Colors[0].Count;
          }
        }
      }
    }

    var SpectrumColors = [];

    for (var SlotIndex = 0; SlotIndex < 48; SlotIndex++) {
      ColorSlots[SlotIndex].Red = Math.round(
        Math.round(ColorSlots[SlotIndex].Red * ShadesScale) * InverseShadesScale
      );
      ColorSlots[SlotIndex].Green = Math.round(
        Math.round(ColorSlots[SlotIndex].Green * ShadesScale) *
          InverseShadesScale
      );
      ColorSlots[SlotIndex].Blue = Math.round(
        Math.round(ColorSlots[SlotIndex].Blue * ShadesScale) *
          InverseShadesScale
      );

      SpectrumColors.push({
        Red: ColorSlots[SlotIndex].Red,
        Green: ColorSlots[SlotIndex].Green,
        Blue: ColorSlots[SlotIndex].Blue,
      });
    }

    ImageInfos.SpectrumPalettes.push(SpectrumColors);

    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * Canvas.width) * 4;

      var Red = Data.data[PixelIndex];
      var Green = Data.data[PixelIndex + 1];
      var Blue = Data.data[PixelIndex + 2];
      var Alpha = Data.data[PixelIndex + 3];
      var Luminance = Red * 0.21 + Green * 0.72 + Blue * 0.07;

      if (Alpha == 255) {
        // Find the matching color index.

        var LastDistance = Number.MAX_VALUE;
        var RemappedColor = {};
        var SpectrumColor = {};

        for (var ColorIndex = 0; ColorIndex < 16; ColorIndex++) {
          SpectrumColor.Red = ColorSlots[GetColorSlotIndex(X, ColorIndex)].Red;
          SpectrumColor.Green =
            ColorSlots[GetColorSlotIndex(X, ColorIndex)].Green;
          SpectrumColor.Blue =
            ColorSlots[GetColorSlotIndex(X, ColorIndex)].Blue;

          var RedDelta = SpectrumColor.Red - Red;
          var GreenDelta = SpectrumColor.Green - Green;
          var BlueDelta = SpectrumColor.Blue - Blue;

          var Luminance2 =
            SpectrumColor.Red * 0.21 +
            SpectrumColor.Green * 0.72 +
            SpectrumColor.Blue * 0.07;
          var LuminanceDelta = Luminance2 - Luminance;

          var Distance = ColorDistance(
            RedDelta,
            GreenDelta,
            BlueDelta,
            LuminanceDelta
          );

          if (Distance < LastDistance) {
            RemappedColor.Red = SpectrumColor.Red;
            RemappedColor.Green = SpectrumColor.Green;
            RemappedColor.Blue = SpectrumColor.Blue;

            LastDistance = Distance;
          }
        }

        if (DitherPattern) {
          {
            var RedDelta = RemappedColor.Red - Red;
            var GreenDelta = RemappedColor.Green - Green;
            var BlueDelta = RemappedColor.Blue - Blue;

            if (X < Canvas.width - 2) {
              if (DitherPattern[4]) {
                Data.data[PixelIndex + 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 8] - RedDelta * DitherPattern[4]
                    )
                  )
                );
                Data.data[PixelIndex + 8 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 8 + 1] -
                        GreenDelta * DitherPattern[4]
                    )
                  )
                );
                Data.data[PixelIndex + 8 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 8 + 2] -
                        BlueDelta * DitherPattern[4]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 1 && DitherPattern[9]) {
                Data.data[PixelIndex + Canvas.width * 4 + 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 8] -
                        RedDelta * DitherPattern[9]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 8 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 8 + 1] -
                        GreenDelta * DitherPattern[9]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 8 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 8 + 2] -
                        BlueDelta * DitherPattern[9]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[14]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 + 8] -
                        RedDelta * DitherPattern[14]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 1] -
                          GreenDelta * DitherPattern[14]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 2] -
                          BlueDelta * DitherPattern[14]
                      )
                    )
                  );
              }
            }

            if (X < Canvas.width - 1) {
              if (DitherPattern[3]) {
                Data.data[PixelIndex + 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 4] - RedDelta * DitherPattern[3]
                    )
                  )
                );
                Data.data[PixelIndex + 4 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 4 + 1] -
                        GreenDelta * DitherPattern[3]
                    )
                  )
                );
                Data.data[PixelIndex + 4 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 4 + 2] -
                        BlueDelta * DitherPattern[3]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 1 && DitherPattern[8]) {
                Data.data[PixelIndex + Canvas.width * 4 + 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 4] -
                        RedDelta * DitherPattern[8]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 4 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 4 + 1] -
                        GreenDelta * DitherPattern[8]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 4 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 4 + 2] -
                        BlueDelta * DitherPattern[8]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[13]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 + 4] -
                        RedDelta * DitherPattern[13]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 1] -
                          GreenDelta * DitherPattern[13]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 2] -
                          BlueDelta * DitherPattern[13]
                      )
                    )
                  );
              }
            }

            if (Y < Canvas.height - 1 && DitherPattern[7]) {
              Data.data[PixelIndex + Canvas.width * 4] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 4] -
                      RedDelta * DitherPattern[7]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 4 + 1] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 4 + 1] -
                      GreenDelta * DitherPattern[7]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 4 + 2] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 4 + 2] -
                      BlueDelta * DitherPattern[7]
                  )
                )
              );
            }

            if (Y < Canvas.height - 2 && DitherPattern[12]) {
              Data.data[PixelIndex + Canvas.width * 2 * 4] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 2 * 4] -
                      RedDelta * DitherPattern[12]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 2 * 4 + 1] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 2 * 4 + 1] -
                      GreenDelta * DitherPattern[12]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 2 * 4 + 2] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 2 * 4 + 2] -
                      BlueDelta * DitherPattern[12]
                  )
                )
              );
            }

            if (X > 0) {
              if (Y < Canvas.height - 1 && DitherPattern[6]) {
                Data.data[PixelIndex + Canvas.width * 4 - 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 4] -
                        RedDelta * DitherPattern[6]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 4 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 4 + 1] -
                        GreenDelta * DitherPattern[6]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 4 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 4 + 2] -
                        BlueDelta * DitherPattern[6]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[11]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 - 4] -
                        RedDelta * DitherPattern[11]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 1] -
                          GreenDelta * DitherPattern[11]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 2] -
                          BlueDelta * DitherPattern[11]
                      )
                    )
                  );
              }
            }

            if (X > 1) {
              if (Y < Canvas.height - 1 && DitherPattern[5]) {
                Data.data[PixelIndex + Canvas.width * 4 - 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 8] -
                        RedDelta * DitherPattern[5]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 8 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 8 + 1] -
                        GreenDelta * DitherPattern[5]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 8 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 8 + 2] -
                        BlueDelta * DitherPattern[5]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[10]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 - 8] -
                        RedDelta * DitherPattern[10]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 1] -
                          GreenDelta * DitherPattern[10]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 2] -
                          BlueDelta * DitherPattern[10]
                      )
                    )
                  );
              }
            }
          }
        }

        Data.data[PixelIndex] = RemappedColor.Red;
        Data.data[PixelIndex + 1] = RemappedColor.Green;
        Data.data[PixelIndex + 2] = RemappedColor.Blue;
        Data.data[PixelIndex + 3] = 255;
      }
    }
  }

  Context.putImageData(Data, 0, 0);
}

var rgbToLabTable = {};

function rgb2lab(rgb) {
  let id = (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];

  if (rgbToLabTable[id]) {
    return rgbToLabTable[id];
  }

  var r = rgb[0] / 255,
    g = rgb[1] / 255,
    b = rgb[2] / 255,
    x,
    y,
    z;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.0;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  let lab = (rgbToLabTable[id] = [116 * y - 16, 500 * (x - y), 200 * (y - z)]);

  return lab;
}

// calculate the perceptual distance between colors in CIELAB
// https://github.com/THEjoezack/ColorMine/blob/master/ColorMine/ColorSpaces/Comparisons/Cie94Comparison.cs

function deltaE(labA, labB) {
  var deltaL = labA[0] - labB[0];
  var deltaA = labA[1] - labB[1];
  var deltaB = labA[2] - labB[2];
  var c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
  var c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
  var deltaC = c1 - c2;
  var deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
  deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
  var sc = 1.0 + 0.045 * c1;
  var sh = 1.0 + 0.015 * c1;
  var deltaLKlsl = deltaL / 0.3;
  var deltaCkcsc = deltaC / sc;
  var deltaHkhsh = deltaH / sh;
  var i =
    deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
  return i < 0 ? 0 : i;
}

function RemapSpectrum512Image3(
  Canvas,
  ImageInfos,
  BitsPerColor,
  DitherPattern
) {
  var WorkCanvas = document.createElement("canvas");

  WorkCanvas.width = Canvas.width + 2;
  WorkCanvas.height = Canvas.height + 2;

  var WorkContext = WorkCanvas.getContext("2d");

  WorkContext.drawImage(Canvas, 0, 0, Canvas.width, Canvas.height);

  var WorkImageData = WorkContext.getImageData(
    0,
    0,
    WorkCanvas.width,
    WorkCanvas.height
  );
  var WorkData = WorkImageData.data;

  var OriginalDitherPattern = [
    0,
    0,
    0,
    7.0 / 16.0,
    0,
    0,
    3.0 / 16.0,
    5.0 / 16.0,
    1.0 / 16.0,
    0,
    0,
    0,
    0,
    0,
    0,
  ];

  var ShadesPerColor = 1 << BitsPerColor;
  var ShadesScale = (ShadesPerColor - 1) / 255;
  var InverseShadesScale = 1 / ShadesScale;

  for (var Y = 0; Y < Canvas.height; Y++) {
    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * WorkCanvas.width) * 4;

      var Red = WorkData[PixelIndex];
      var Green = WorkData[PixelIndex + 1];
      var Blue = WorkData[PixelIndex + 2];
      var Alpha = WorkData[PixelIndex + 3];
      var Luminance = Red * 0.21 + Green * 0.72 + Blue * 0.07;

      if (Alpha == 255) {
        var NewRed = Math.round(
          Math.round(Red * ShadesScale) * InverseShadesScale
        );
        var NewGreen = Math.round(
          Math.round(Green * ShadesScale) * InverseShadesScale
        );
        var NewBlue = Math.round(
          Math.round(Blue * ShadesScale) * InverseShadesScale
        );

        if (OriginalDitherPattern) {
          var RedDelta = NewRed - Red;
          var GreenDelta = NewGreen - Green;
          var BlueDelta = NewBlue - Blue;

          WorkData[PixelIndex + 8] -= RedDelta * OriginalDitherPattern[4];
          WorkData[PixelIndex + 8 + 1] -= GreenDelta * OriginalDitherPattern[4];
          WorkData[PixelIndex + 8 + 2] -= BlueDelta * OriginalDitherPattern[4];

          WorkData[PixelIndex + WorkCanvas.width * 4 + 8] -=
            RedDelta * OriginalDitherPattern[9];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 8 + 1] -=
            GreenDelta * OriginalDitherPattern[9];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 8 + 2] -=
            BlueDelta * OriginalDitherPattern[9];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 8] -=
            RedDelta * OriginalDitherPattern[14];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 8 + 1] -=
            GreenDelta * OriginalDitherPattern[14];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 8 + 2] -=
            BlueDelta * OriginalDitherPattern[14];

          WorkData[PixelIndex + 4] -= RedDelta * OriginalDitherPattern[3];
          WorkData[PixelIndex + 4 + 1] -= GreenDelta * OriginalDitherPattern[3];
          WorkData[PixelIndex + 4 + 2] -= BlueDelta * OriginalDitherPattern[3];

          WorkData[PixelIndex + WorkCanvas.width * 4 + 4] -=
            RedDelta * OriginalDitherPattern[8];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 4 + 1] -=
            GreenDelta * OriginalDitherPattern[8];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 4 + 2] -=
            BlueDelta * OriginalDitherPattern[8];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 4] -=
            RedDelta * OriginalDitherPattern[13];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 4 + 1] -=
            GreenDelta * OriginalDitherPattern[13];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 4 + 2] -=
            BlueDelta * OriginalDitherPattern[13];

          WorkData[PixelIndex + WorkCanvas.width * 4] -=
            RedDelta * OriginalDitherPattern[7];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 1] -=
            GreenDelta * OriginalDitherPattern[7];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 2] -=
            BlueDelta * OriginalDitherPattern[7];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4] -=
            RedDelta * OriginalDitherPattern[12];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 1] -=
            GreenDelta * OriginalDitherPattern[12];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 2] -=
            BlueDelta * OriginalDitherPattern[12];

          WorkData[PixelIndex + WorkCanvas.width * 4 - 4] -=
            RedDelta * OriginalDitherPattern[6];
          WorkData[PixelIndex + WorkCanvas.width * 4 - 4 + 1] -=
            GreenDelta * OriginalDitherPattern[6];
          WorkData[PixelIndex + WorkCanvas.width * 4 - 4 + 2] -=
            BlueDelta * OriginalDitherPattern[6];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 4] -=
            RedDelta * OriginalDitherPattern[11];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 4 + 1] -=
            GreenDelta * OriginalDitherPattern[11];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 4 + 2] -=
            BlueDelta * OriginalDitherPattern[11];

          WorkData[PixelIndex + WorkCanvas.width * 4 - 8] -=
            RedDelta * OriginalDitherPattern[5];
          WorkData[PixelIndex + WorkCanvas.width * 4 - 8 + 1] -=
            GreenDelta * OriginalDitherPattern[5];
          WorkData[PixelIndex + WorkCanvas.width * 4 - 8 + 2] -=
            BlueDelta * OriginalDitherPattern[5];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 8] -=
            RedDelta * OriginalDitherPattern[10];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 8 + 1] -=
            GreenDelta * OriginalDitherPattern[10];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 8 + 2] -=
            BlueDelta * OriginalDitherPattern[10];
        }

        WorkData[PixelIndex] = NewRed;
        WorkData[PixelIndex + 1] = NewGreen;
        WorkData[PixelIndex + 2] = NewBlue;
        WorkData[PixelIndex + 3] = 255;
      }
    }
  }

  //WorkContext.putImageData(WorkImageData, 0, 0);

  // Spectrumize it.

  var Context = Canvas.getContext("2d");
  var ImageData = Context.getImageData(0, 0, Canvas.width, Canvas.height);
  var Data = ImageData.data;

  ImageInfos.SpectrumPalettes = [];
  ImageInfos.ConvertedBitsPerColor = BitsPerColor;

  for (var Y = 0; Y < Canvas.height; Y++) {
    // Fill Spectrum 512/4k color slots.

    var ColorSlots = [];

    for (var ColorSlotIndex = 0; ColorSlotIndex < 48; ColorSlotIndex++) {
      var Red = 0;
      var Green = 0;
      var Blue = 0;

      var Count = 0;

      if (ColorSlotIndex == 0 || ColorSlotIndex == 32) Count = 2;

      ColorSlots.push({
        Red: Red,
        Green: Green,
        Blue: Blue,
        Count: Count,
        ColorSlotIndex: ColorSlotIndex,
      });
    }

    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * WorkCanvas.width) * 4;

      var Red = WorkData[PixelIndex];
      var Green = WorkData[PixelIndex + 1];
      var Blue = WorkData[PixelIndex + 2];
      var Alpha = WorkData[PixelIndex + 3];
      var Luminance =
        SrgbToRgb(Red) * 0.21 +
        SrgbToRgb(Green) * 0.72 +
        SrgbToRgb(Blue) * 0.07;

      if (Alpha == 255) {
        var Colors = [];

        Colors.push({ Red: Red, Green: Green, Blue: Blue, Count: 1 });

        var ColorIndex;

        for (ColorIndex = 0; ColorIndex < 16; ColorIndex++) {
          var SpectrumColor = ColorSlots[GetColorSlotIndex(X, ColorIndex)];

          if (
            SpectrumColor.Red == Red &&
            SpectrumColor.Green == Green &&
            SpectrumColor.Blue == Blue
          ) {
            SpectrumColor.Count++;

            break;
          }

          if (SpectrumColor.Count == 0) {
            SpectrumColor.Red = Red;
            SpectrumColor.Green = Green;
            SpectrumColor.Blue = Blue;

            SpectrumColor.Count = 1;

            break;
          }

          Colors.push(SpectrumColor);
        }

        if (ColorIndex == 16) {
          var LastDistance = Number.MAX_VALUE;
          var Color1;
          var Color2;

          for (var Index1 = 0; Index1 < Colors.length - 1; Index1++) {
            for (var Index2 = Index1 + 1; Index2 < Colors.length; Index2++) {
              //							if(Colors[Index1].ColorSlotIndex < Colors[Index2].ColorSlotIndex && Colors[Index2].ColorSlotIndex == 32 || Colors[Index2].ColorSlotIndex < Colors[Index1].ColorSlotIndex && Colors[Index1].ColorSlotIndex == 32)
              if (
                Colors[Index2].ColorSlotIndex == 32 ||
                Colors[Index1].ColorSlotIndex == 32
              )
                continue;

              let labColor1 = rgb2lab([
                Colors[Index1].Red,
                Colors[Index1].Green,
                Colors[Index1].Blue,
              ]);
              let labColor2 = rgb2lab([
                Colors[Index2].Red,
                Colors[Index2].Green,
                Colors[Index2].Blue,
              ]);
              let Distance = deltaE(labColor1, labColor2);

              //							var TotalCount = Colors[Index1].Count * Colors[Index2].Count;
              var TotalCount =
                Colors[Index1].Count * Colors[Index1].Count +
                Colors[Index2].Count * Colors[Index2].Count;

              Distance *= Math.pow(TotalCount, 0.6);
              //							Distance *= TotalCount;

              if (Distance < LastDistance) {
                LastDistance = Distance;

                Color1 = Colors[Index1];
                Color2 = Colors[Index2];
              }
            }
          }

          if (Color1 == Colors[0]) {
            Color2.Red =
              (Color1.Red * Color1.Count + Color2.Red * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Green =
              (Color1.Green * Color1.Count + Color2.Green * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Blue =
              (Color1.Blue * Color1.Count + Color2.Blue * Color2.Count) /
              (Color1.Count + Color2.Count);

            Color2.Count = Color1.Count + Color2.Count;
          } else if (Color1.ColorSlotIndex < Color2.ColorSlotIndex) {
            Color1.Red =
              (Color1.Red * Color1.Count + Color2.Red * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color1.Green =
              (Color1.Green * Color1.Count + Color2.Green * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color1.Blue =
              (Color1.Blue * Color1.Count + Color2.Blue * Color2.Count) /
              (Color1.Count + Color2.Count);

            Color1.Count = Color1.Count + Color2.Count;

            Color2.Red = Colors[0].Red;
            Color2.Green = Colors[0].Green;
            Color2.Blue = Colors[0].Blue;

            Color2.Count = Colors[0].Count;
          } else {
            Color2.Red =
              (Color1.Red * Color1.Count + Color2.Red * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Green =
              (Color1.Green * Color1.Count + Color2.Green * Color2.Count) /
              (Color1.Count + Color2.Count);
            Color2.Blue =
              (Color1.Blue * Color1.Count + Color2.Blue * Color2.Count) /
              (Color1.Count + Color2.Count);

            Color2.Count = Color1.Count + Color2.Count;

            Color1.Red = Colors[0].Red;
            Color1.Green = Colors[0].Green;
            Color1.Blue = Colors[0].Blue;

            Color1.Count = Colors[0].Count;
          }
        }
      }
    }

    var SpectrumColors = [];

    for (var SlotIndex = 0; SlotIndex < 48; SlotIndex++) {
      ColorSlots[SlotIndex].Red = Math.round(
        Math.round(ColorSlots[SlotIndex].Red * ShadesScale) * InverseShadesScale
      );
      ColorSlots[SlotIndex].Green = Math.round(
        Math.round(ColorSlots[SlotIndex].Green * ShadesScale) *
          InverseShadesScale
      );
      ColorSlots[SlotIndex].Blue = Math.round(
        Math.round(ColorSlots[SlotIndex].Blue * ShadesScale) *
          InverseShadesScale
      );

      SpectrumColors.push({
        Red: ColorSlots[SlotIndex].Red,
        Green: ColorSlots[SlotIndex].Green,
        Blue: ColorSlots[SlotIndex].Blue,
      });
    }

    ImageInfos.SpectrumPalettes.push(SpectrumColors);

    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * WorkCanvas.width) * 4;
      var DisplayPixelIndex = (X + Y * Canvas.width) * 4;

      var Red = WorkData[PixelIndex];
      var Green = WorkData[PixelIndex + 1];
      var Blue = WorkData[PixelIndex + 2];
      var Alpha = WorkData[PixelIndex + 3];
      var Luminance =
        SrgbToRgb(Red) * 0.21 +
        SrgbToRgb(Green) * 0.72 +
        SrgbToRgb(Blue) * 0.07;

      if (Alpha == 255) {
        // Find the matching color index.

        var LastDistance = Number.MAX_VALUE;
        var RemappedColor = {};
        var SpectrumColor = {};

        for (var ColorIndex = 0; ColorIndex < 16; ColorIndex++) {
          SpectrumColor.Red = ColorSlots[GetColorSlotIndex(X, ColorIndex)].Red;
          SpectrumColor.Green =
            ColorSlots[GetColorSlotIndex(X, ColorIndex)].Green;
          SpectrumColor.Blue =
            ColorSlots[GetColorSlotIndex(X, ColorIndex)].Blue;

          var RedDelta = SrgbToRgb(SpectrumColor.Red) - SrgbToRgb(Red);
          var GreenDelta = SrgbToRgb(SpectrumColor.Green) - SrgbToRgb(Green);
          var BlueDelta = SrgbToRgb(SpectrumColor.Blue) - SrgbToRgb(Blue);

          var Luminance2 =
            SrgbToRgb(SpectrumColor.Red) * 0.21 +
            SrgbToRgb(SpectrumColor.Green) * 0.72 +
            SrgbToRgb(SpectrumColor.Blue) * 0.07;
          var LuminanceDelta = Luminance2 - Luminance;

          var Distance = ColorDistance(
            RedDelta,
            GreenDelta,
            BlueDelta,
            LuminanceDelta
          );

          if (Distance < LastDistance) {
            RemappedColor.Red = SpectrumColor.Red;
            RemappedColor.Green = SpectrumColor.Green;
            RemappedColor.Blue = SpectrumColor.Blue;

            LastDistance = Distance;
          }
        }

        if (DitherPattern) {
          var RedDelta = RemappedColor.Red - Red;
          var GreenDelta = RemappedColor.Green - Green;
          var BlueDelta = RemappedColor.Blue - Blue;

          WorkData[PixelIndex + 8] -= RedDelta * DitherPattern[4];
          WorkData[PixelIndex + 8 + 1] -= GreenDelta * DitherPattern[4];
          WorkData[PixelIndex + 8 + 2] -= BlueDelta * DitherPattern[4];

          WorkData[PixelIndex + WorkCanvas.width * 4 + 8] -=
            RedDelta * DitherPattern[9];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 8 + 1] -=
            GreenDelta * DitherPattern[9];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 8 + 2] -=
            BlueDelta * DitherPattern[9];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 8] -=
            RedDelta * DitherPattern[14];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 8 + 1] -=
            GreenDelta * DitherPattern[14];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 8 + 2] -=
            BlueDelta * DitherPattern[14];

          WorkData[PixelIndex + 4] -= RedDelta * DitherPattern[3];
          WorkData[PixelIndex + 4 + 1] -= GreenDelta * DitherPattern[3];
          WorkData[PixelIndex + 4 + 2] -= BlueDelta * DitherPattern[3];

          WorkData[PixelIndex + WorkCanvas.width * 4 + 4] -=
            RedDelta * DitherPattern[8];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 4 + 1] -=
            GreenDelta * DitherPattern[8];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 4 + 2] -=
            BlueDelta * DitherPattern[8];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 4] -=
            RedDelta * DitherPattern[13];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 4 + 1] -=
            GreenDelta * DitherPattern[13];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 4 + 2] -=
            BlueDelta * DitherPattern[13];

          WorkData[PixelIndex + WorkCanvas.width * 4] -=
            RedDelta * DitherPattern[7];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 1] -=
            GreenDelta * DitherPattern[7];
          WorkData[PixelIndex + WorkCanvas.width * 4 + 2] -=
            BlueDelta * DitherPattern[7];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4] -=
            RedDelta * DitherPattern[12];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 1] -=
            GreenDelta * DitherPattern[12];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 + 2] -=
            BlueDelta * DitherPattern[12];

          WorkData[PixelIndex + WorkCanvas.width * 4 - 4] -=
            RedDelta * DitherPattern[6];
          WorkData[PixelIndex + WorkCanvas.width * 4 - 4 + 1] -=
            GreenDelta * DitherPattern[6];
          WorkData[PixelIndex + WorkCanvas.width * 4 - 4 + 2] -=
            BlueDelta * DitherPattern[6];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 4] -=
            RedDelta * DitherPattern[11];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 4 + 1] -=
            GreenDelta * DitherPattern[11];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 4 + 2] -=
            BlueDelta * DitherPattern[11];

          WorkData[PixelIndex + WorkCanvas.width * 4 - 8] -=
            RedDelta * DitherPattern[5];
          WorkData[PixelIndex + WorkCanvas.width * 4 - 8 + 1] -=
            GreenDelta * DitherPattern[5];
          WorkData[PixelIndex + WorkCanvas.width * 4 - 8 + 2] -=
            BlueDelta * DitherPattern[5];

          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 8] -=
            RedDelta * DitherPattern[10];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 8 + 1] -=
            GreenDelta * DitherPattern[10];
          WorkData[PixelIndex + WorkCanvas.width * 2 * 4 - 8 + 2] -=
            BlueDelta * DitherPattern[10];
        }

        Data[DisplayPixelIndex] = RemappedColor.Red;
        Data[DisplayPixelIndex + 1] = RemappedColor.Green;
        Data[DisplayPixelIndex + 2] = RemappedColor.Blue;
        Data[DisplayPixelIndex + 3] = 255;
      }
    }
  }

  Context.putImageData(ImageData, 0, 0);
}

function RemapFullPaletteImageLuminance(Canvas, BitsPerColor, DitherPattern) {
  var Context = Canvas.getContext("2d");
  var Data = Context.getImageData(0, 0, Canvas.width, Canvas.height);
  var ShadesPerColor = 1 << BitsPerColor;

  for (var Y = 0; Y < Canvas.height; Y++) {
    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * Canvas.width) * 4;

      var Red = Data.data[PixelIndex];
      var Green = Data.data[PixelIndex + 1];
      var Blue = Data.data[PixelIndex + 2];
      var Alpha = Data.data[PixelIndex + 3];
      var Luminance = Red * 0.21 + Green * 0.72 + Blue * 0.07;

      if (Alpha == 255) {
        if (DitherPattern) {
          if (DitherPattern[0] == 1) {
            // Checker pattern.
          } // Error diffusion.
          else {
            var ShadesScale = (ShadesPerColor - 1) / 255;
            var InverseShadesScale = 1 / ShadesScale;

            var MatchingRed = Math.round(
              Math.round(Red * ShadesScale) * InverseShadesScale
            );
            var MatchingGreen = Math.round(
              Math.round(Green * ShadesScale) * InverseShadesScale
            );
            var MatchingBlue = Math.round(
              Math.round(Blue * ShadesScale) * InverseShadesScale
            );

            var RedDelta = MatchingRed - Red;
            var GreenDelta = MatchingGreen - Green;
            var BlueDelta = MatchingBlue - Blue;

            if (X < Canvas.width - 2) {
              if (DitherPattern[4]) {
                Data.data[PixelIndex + 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 8] - RedDelta * DitherPattern[4]
                    )
                  )
                );
                Data.data[PixelIndex + 8 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 8 + 1] -
                        GreenDelta * DitherPattern[4]
                    )
                  )
                );
                Data.data[PixelIndex + 8 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 8 + 2] -
                        BlueDelta * DitherPattern[4]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 1 && DitherPattern[9]) {
                Data.data[PixelIndex + Canvas.width * 4 + 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 8] -
                        RedDelta * DitherPattern[9]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 8 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 8 + 1] -
                        GreenDelta * DitherPattern[9]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 8 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 8 + 2] -
                        BlueDelta * DitherPattern[9]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[14]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 + 8] -
                        RedDelta * DitherPattern[14]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 1] -
                          GreenDelta * DitherPattern[14]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 8 + 2] -
                          BlueDelta * DitherPattern[14]
                      )
                    )
                  );
              }
            }

            if (X < Canvas.width - 1) {
              if (DitherPattern[3]) {
                Data.data[PixelIndex + 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 4] - RedDelta * DitherPattern[3]
                    )
                  )
                );
                Data.data[PixelIndex + 4 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 4 + 1] -
                        GreenDelta * DitherPattern[3]
                    )
                  )
                );
                Data.data[PixelIndex + 4 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + 4 + 2] -
                        BlueDelta * DitherPattern[3]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 1 && DitherPattern[8]) {
                Data.data[PixelIndex + Canvas.width * 4 + 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 4] -
                        RedDelta * DitherPattern[8]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 4 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 4 + 1] -
                        GreenDelta * DitherPattern[8]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 + 4 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 + 4 + 2] -
                        BlueDelta * DitherPattern[8]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[13]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 + 4] -
                        RedDelta * DitherPattern[13]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 1] -
                          GreenDelta * DitherPattern[13]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 + 4 + 2] -
                          BlueDelta * DitherPattern[13]
                      )
                    )
                  );
              }
            }

            if (Y < Canvas.height - 1 && DitherPattern[7]) {
              Data.data[PixelIndex + Canvas.width * 4] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 4] -
                      RedDelta * DitherPattern[7]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 4 + 1] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 4 + 1] -
                      GreenDelta * DitherPattern[7]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 4 + 2] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 4 + 2] -
                      BlueDelta * DitherPattern[7]
                  )
                )
              );
            }

            if (Y < Canvas.height - 2 && DitherPattern[12]) {
              Data.data[PixelIndex + Canvas.width * 2 * 4] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 2 * 4] -
                      RedDelta * DitherPattern[12]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 2 * 4 + 1] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 2 * 4 + 1] -
                      GreenDelta * DitherPattern[12]
                  )
                )
              );
              Data.data[PixelIndex + Canvas.width * 2 * 4 + 2] = Math.round(
                Math.min(
                  255,
                  Math.max(
                    0,
                    Data.data[PixelIndex + Canvas.width * 2 * 4 + 2] -
                      BlueDelta * DitherPattern[12]
                  )
                )
              );
            }

            if (X > 0) {
              if (Y < Canvas.height - 1 && DitherPattern[6]) {
                Data.data[PixelIndex + Canvas.width * 4 - 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 4] -
                        RedDelta * DitherPattern[6]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 4 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 4 + 1] -
                        GreenDelta * DitherPattern[6]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 4 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 4 + 2] -
                        BlueDelta * DitherPattern[6]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[11]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 4] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 - 4] -
                        RedDelta * DitherPattern[11]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 1] -
                          GreenDelta * DitherPattern[11]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 4 + 2] -
                          BlueDelta * DitherPattern[11]
                      )
                    )
                  );
              }
            }

            if (X > 1) {
              if (Y < Canvas.height - 1 && DitherPattern[5]) {
                Data.data[PixelIndex + Canvas.width * 4 - 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 8] -
                        RedDelta * DitherPattern[5]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 8 + 1] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 8 + 1] -
                        GreenDelta * DitherPattern[5]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 4 - 8 + 2] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 4 - 8 + 2] -
                        BlueDelta * DitherPattern[5]
                    )
                  )
                );
              }

              if (Y < Canvas.height - 2 && DitherPattern[10]) {
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 8] = Math.round(
                  Math.min(
                    255,
                    Math.max(
                      0,
                      Data.data[PixelIndex + Canvas.width * 2 * 4 - 8] -
                        RedDelta * DitherPattern[10]
                    )
                  )
                );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 1] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 1] -
                          GreenDelta * DitherPattern[10]
                      )
                    )
                  );
                Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 2] =
                  Math.round(
                    Math.min(
                      255,
                      Math.max(
                        0,
                        Data.data[PixelIndex + Canvas.width * 2 * 4 - 8 + 2] -
                          BlueDelta * DitherPattern[10]
                      )
                    )
                  );
              }
            }
          }
        }

        Data.data[PixelIndex] = MatchingRed;
        Data.data[PixelIndex + 1] = MatchingGreen;
        Data.data[PixelIndex + 2] = MatchingBlue;
        Data.data[PixelIndex + 3] = 255;
      }
    }
  }

  Context.putImageData(Data, 0, 0);
}

function ResizeDisplayCanvas(Id, Width, Height, DisplayWidth, DisplayHeight) {
  var ImageInfos = document.getElementById("window_div_" + Id).ImageInfos;

  if (Width == 0 || Height == 0) {
    Width = ImageInfos.Image.width;
    Height = ImageInfos.Image.height;

    var ImageScaleFactor = 1;

    while (Width * ImageScaleFactor < 640 * DevicePixelRatio)
      ImageScaleFactor++;

    DisplayWidth = Width * ImageScaleFactor;

    if (ImageInfos.AspectX && ImageInfos.AspectY)
      DisplayHeight = Math.floor(
        (Height * ImageScaleFactor * ImageInfos.AspectY) / ImageInfos.AspectX
      );
    else if (ImageInfos.Image.width == 640 && ImageInfos.Image.height == 200)
      DisplayHeight = Height * ImageScaleFactor * 2;
    else DisplayHeight = Height * ImageScaleFactor;
  }

  DisplayWidth /= DevicePixelRatio;
  DisplayHeight /= DevicePixelRatio;

  var OriginalCanvas = document.getElementById("original_canvas_" + Id);

  var ResizedCanvas = document.createElement("canvas");

  ResizedCanvas.width = Width;
  ResizedCanvas.height = Height;

  var ResizedContext = ResizedCanvas.getContext("2d");

  if (Width == ImageInfos.Image.width && Height == ImageInfos.Image.height) {
    ResizedContext.drawImage(OriginalCanvas, 0, 0);
  } else {
    var Work1Canvas = document.createElement("canvas");

    Work1Canvas.width = Width * 4 + 1;
    Work1Canvas.height = Height * 4 + 1;

    var Work1Context = Work1Canvas.getContext("2d");

    Work1Context.imageSmoothingEnabled = true;

    var Work2Canvas = document.createElement("canvas");

    Work2Canvas.width = Width * 2;
    Work2Canvas.height = Height * 2;

    var Work2Context = Work2Canvas.getContext("2d");

    Work2Context.imageSmoothingEnabled = true;

    var CropX;
    var CropY;
    var CropWidth;
    var CropHeight;

    if (OriginalCanvas.width / OriginalCanvas.height >= Width / Height) {
      CropWidth = (OriginalCanvas.height * Width) / Height;
      CropHeight = OriginalCanvas.height;
      CropX = (OriginalCanvas.width - CropWidth) / 2;
      CropY = 0;
    } else {
      CropWidth = OriginalCanvas.width;
      CropHeight = (OriginalCanvas.width * Height) / Width;
      CropX = 0;
      CropY = (OriginalCanvas.height - CropHeight) / 2;
    }

    Work1Context.drawImage(
      OriginalCanvas,
      CropX,
      CropY,
      CropWidth,
      CropHeight,
      0,
      0,
      Work1Canvas.width,
      Work1Canvas.height
    );
    Work2Context.drawImage(
      Work1Canvas,
      0,
      0,
      Work1Canvas.width,
      Work1Canvas.height,
      0,
      0,
      Work2Canvas.width,
      Work2Canvas.height
    );
    ResizedContext.drawImage(
      Work2Canvas,
      0,
      0,
      Work2Canvas.width,
      Work2Canvas.height,
      0,
      0,
      ResizedCanvas.width,
      ResizedCanvas.height
    );
  }

  ResizedCanvas.id = "display_canvas_" + Id;
  ResizedCanvas.className = "image_canvas_class";
  ResizedCanvas.style.position = "absolute";
  ResizedCanvas.style.width = DisplayWidth;
  ResizedCanvas.style.height = DisplayHeight;

  var ImageDivId = "image_div_" + Id;

  var DisplayCanvasId = "display_canvas_" + Id;
  var DisplayCanvas = document.getElementById(DisplayCanvasId);

  document
    .getElementById(ImageDivId)
    .replaceChild(ResizedCanvas, DisplayCanvas);

  return ResizedCanvas;
}

function UpdateImageWindow(Id) {
  var DisplayCanvas = document.getElementById("display_canvas_" + Id);
  var OriginalCanvas = document.getElementById("original_canvas_" + Id);
  var ImageDiv = document.getElementById("image_div_" + Id);
  var WindowDiv = document.getElementById("window_div_" + Id);
  var ColorsDiv = document.getElementById("colors_div_" + Id);
  var ColorsCanvas = document.getElementById("colors_canvas_" + Id);
  var TitleBarDiv = document.getElementById("title_bar_div_" + Id);
  var TitleTextSpan = document.getElementById("title_text_span_" + Id);
  var MenuDiv = document.getElementById("menu_div_" + Id);

  var Colors = WindowDiv.ImageInfos.QuantizedColors;

  if (Colors) {
    ColorsDiv.style.height = LineHeight;
    ColorsCanvas.style.height = LineHeight;

    var ColorsContext = ColorsCanvas.getContext("2d");
    var ColorsData = ColorsContext.getImageData(
      0,
      0,
      ColorsCanvas.width,
      ColorsCanvas.height
    );

    for (var X = 0; X < ColorsCanvas.width; X++) {
      var ColorsIndex = Math.floor((X * Colors.length) / ColorsCanvas.width);

      for (var Y = 0; Y < ColorsCanvas.height; Y++) {
        var PixelIndex = (X + Y * ColorsCanvas.width) * 4;

        ColorsData.data[PixelIndex] = Colors[ColorsIndex].Red;
        ColorsData.data[PixelIndex + 1] = Colors[ColorsIndex].Green;
        ColorsData.data[PixelIndex + 2] = Colors[ColorsIndex].Blue;
        ColorsData.data[PixelIndex + 3] = 255;
      }
    }

    ColorsContext.putImageData(ColorsData, 0, 0);
  } else {
    ColorsDiv.style.height = 0;
    ColorsCanvas.style.height = 0;
  }

  OriginalCanvas.style.width = DisplayCanvas.style.width;
  OriginalCanvas.style.height = DisplayCanvas.style.height;

  ImageDiv.style.width = DisplayCanvas.style.width;
  ImageDiv.style.height = DisplayCanvas.style.height;

  WindowDiv.style.width = DisplayCanvas.style.width;
  WindowDiv.style.height =
    parseInt(DisplayCanvas.style.height, 10) +
    LineHeight +
    LineHeight +
    (Colors ? LineHeight : 0);

  ColorsCanvas.style.width = DisplayCanvas.style.width;

  TitleBarDiv.style.width = DisplayCanvas.style.width;

  TitleTextSpan.style.width =
    parseInt(DisplayCanvas.style.width, 10) - LineWidth;

  MenuDiv.style.width = parseInt(DisplayCanvas.style.width, 10) - LineWidth;
}

function CreateImageWindow(ImageInfos) {
  var ImageScaleFactor = 1;

  while (ImageInfos.Image.width * ImageScaleFactor < 640 * DevicePixelRatio)
    ImageScaleFactor++;

  var OriginalCanvas = document.createElement("canvas");

  OriginalCanvas.id = "original_canvas_" + ImageInfos.Id;
  OriginalCanvas.className = "image_canvas_class";
  OriginalCanvas.width = ImageInfos.Image.width;
  OriginalCanvas.height = ImageInfos.Image.height;
  OriginalCanvas.style.position = "absolute";
  OriginalCanvas.style.width =
    (OriginalCanvas.width * ImageScaleFactor) / DevicePixelRatio;

  if (ImageInfos.AspectX && ImageInfos.AspectY)
    OriginalCanvas.style.height =
      Math.floor(
        (OriginalCanvas.height * ImageScaleFactor * ImageInfos.AspectY) /
          ImageInfos.AspectX
      ) / DevicePixelRatio;
  else if (ImageInfos.Image.width == 640 && ImageInfos.Image.height == 200)
    OriginalCanvas.style.height =
      (OriginalCanvas.height * ImageScaleFactor * 2) / DevicePixelRatio;
  else
    OriginalCanvas.style.height =
      (OriginalCanvas.height * ImageScaleFactor) / DevicePixelRatio;

  OriginalCanvas.getContext("2d").drawImage(
    ImageInfos.Image,
    0,
    0,
    ImageInfos.Image.width,
    ImageInfos.Image.height
  );

  var DisplayCanvas = document.createElement("canvas");

  DisplayCanvas.id = "display_canvas_" + ImageInfos.Id;
  DisplayCanvas.className = "image_canvas_class";
  DisplayCanvas.width = OriginalCanvas.width;
  DisplayCanvas.height = OriginalCanvas.height;
  DisplayCanvas.style.position = "absolute";
  DisplayCanvas.style.width = OriginalCanvas.style.width;
  DisplayCanvas.style.height = OriginalCanvas.style.height;

  DisplayCanvas.getContext("2d").drawImage(
    ImageInfos.Image,
    0,
    0,
    ImageInfos.Image.width,
    ImageInfos.Image.height
  );

  var ColorsCanvas = document.createElement("canvas");

  ColorsCanvas.id = "colors_canvas_" + ImageInfos.Id;
  ColorsCanvas.className = "colors_canvas_class";
  ColorsCanvas.width = ImageInfos.Image.width;
  ColorsCanvas.height = LineHeight;
  ColorsCanvas.style.position = "absolute";
  ColorsCanvas.style.width = OriginalCanvas.style.width;
  ColorsCanvas.style.height = LineHeight;

  var WindowDiv = document.createElement("div");
  var TitleBarDiv = document.createElement("div");
  var MenuDiv = document.createElement("div");
  var ImageDiv = document.createElement("div");
  var ColorsDiv = document.createElement("div");
  var TitleTextSpan = document.createElement("span");
  var CloseLabel = document.createElement("label");

  WindowDiv.ImageInfos = ImageInfos;

  WindowDiv.id = "window_div_" + ImageInfos.Id;
  WindowDiv.className = "window_class";
  WindowDiv.draggable = "true";
  WindowDiv.style.left = GlobalWindowIdCounter % 32;
  WindowDiv.style.top = GlobalWindowIdCounter % 20;
  WindowDiv.style.width = OriginalCanvas.style.width;
  WindowDiv.style.height =
    parseInt(OriginalCanvas.style.height, 10) +
    LineHeight +
    LineHeight +
    LineHeight;
  WindowDiv.style.zIndex = GlobalWindowZIndexCounter++;
  WindowDiv.addEventListener(
    "dragstart",
    function (Event) {
      Event.dataTransfer.setData(
        "Text",
        Event.screenX + "," + Event.screenY + "," + this.id
      );
    },
    false
  );
  //WindowDiv.addEventListener("touchstart", function(Event) { Event.dataTransfer.setData("Text", Event.screenX + "," + Event.screenY + "," + this.id); }, false);
  WindowDiv.addEventListener(
    "click",
    function (Event) {
      this.style.zIndex = GlobalWindowZIndexCounter++;
    },
    false
  );

  TitleBarDiv.id = "title_bar_div_" + ImageInfos.Id;
  TitleBarDiv.style.width = OriginalCanvas.style.width;
  TitleBarDiv.style.height = LineHeight;

  TitleTextSpan.id = "title_text_span_" + ImageInfos.Id;
  TitleTextSpan.style.float = "left";
  TitleTextSpan.style.display = "block";
  TitleTextSpan.style.textAlign = "center";
  TitleTextSpan.style.width =
    parseInt(DisplayCanvas.style.width, 10) - LineWidth;
  TitleTextSpan.style.height = "100%";
  TitleTextSpan.style.userSelect = "none";
  TitleTextSpan.style.backgroundColor = WindowColor;
  //TitleTextSpan.style.verticalAlign = "middle";
  //TitleTextSpan.style.paddingTop = "2";
  TitleTextSpan.innerHTML =
    encodeURIComponent(ImageInfos.FileName.substr(0, 32)) +
    " [" +
    ImageInfos.Image.width +
    " x " +
    ImageInfos.Image.height +
    ", " +
    GetColors(DisplayCanvas).length +
    " colours]";

  TitleBarDiv.appendChild(TitleTextSpan);

  CloseLabel.id = "close_label_" + ImageInfos.Id;
  CloseLabel.className = "window_button_class";
  CloseLabel.style.float = "right";
  CloseLabel.style.display = "block";
  CloseLabel.style.textAlign = "center";
  CloseLabel.style.width = LineWidth;
  CloseLabel.style.height = "100%";
  CloseLabel.style.backgroundColor = WindowColor;
  //CloseLabel.style.paddingTop = "2";
  CloseLabel.innerHTML = "X";
  //CloseLabel.addEventListener("mouseenter", function(Event) { this.style.backgroundColor = WindowHiliteColor; }, false);
  //CloseLabel.addEventListener("mouseleave", function(Event) { this.style.backgroundColor = WindowColor; }, false);
  CloseLabel.addEventListener(
    "click",
    function (Event) {
      this.parentNode.parentNode.parentNode.removeChild(
        this.parentNode.parentNode
      );
    },
    false
  );

  TitleBarDiv.appendChild(CloseLabel);

  MenuDiv.id = "menu_div_" + ImageInfos.Id;
  MenuDiv.className = "menu_class";
  MenuDiv.style.width = DisplayCanvas.style.width;
  MenuDiv.style.height = LineHeight;
  MenuDiv.style.overflow = "hidden";

  MenuDiv.appendChild(
    CreateMenuItem(ImageInfos.Id, {
      Type: "checkbox",
      Name: "global_colors",
      Text: "Global Colours",
      Action: function () {
        SetGlobalColors(this);
      },
    })
  );

  MenuDiv.appendChild(
    CreateMenuItem(ImageInfos.Id, {
      Type: "label",
      Name: "colors",
      Text: "Colours",
      Options: [
        { Name: "original", Text: "Original" },
        { Name: "─", Text: "────────", Disabled: true },
        { Name: "2", Text: "2" },
        { Name: "4", Text: "4" },
        { Name: "8", Text: "8" },
        { Name: "16", Text: "16" },
        { Name: "32", Text: "32" },
        { Name: "64", Text: "64" },
        { Name: "128", Text: "128" },
        { Name: "256", Text: "256" },
        { Name: "─", Text: "────────", Disabled: true },
        { Name: "spectrum512", Text: "Spectrum 512/4k", Default: true },
        { Name: "neo_raster", Text: "NEOchrome Raster" },
        { Name: "4pchg", Text: "4 (PCHG)" },
        { Name: "8pchg", Text: "8 (PCHG)" },
        { Name: "16pchg", Text: "16 (PCHG)" },
        { Name: "32pchg", Text: "32 (PCHG)" },
        { Name: "64pchg", Text: "64 (PCHG)" },
        { Name: "ehb", Text: "64 (EHB)" },
        { Name: "256-884", Text: "256 (8-8-4)" },
        { Name: "palette", Text: "Palette" },
        { Name: "zx", Text: "16 (ZX Spectrum)" },
        { Name: "─", Text: "────────", Disabled: true },
        { Name: "global", Text: "Global" },
      ],
      Action: function () {
        ProcessMenuAction(this.id.substring(this.id.lastIndexOf("_") + 1));
      },
    })
  );

  MenuDiv.appendChild(
    CreateMenuItem(ImageInfos.Id, {
      Type: "label",
      Name: "palette",
      Text: "Palette",
      Options: [
        { Name: "64", Text: "64 (EGA)" },
        { Name: "256", Text: "256 (8-8-4)" },
        { Name: "512", Text: "512 (ST)" },
        { Name: "4096", Text: "4096 (STE/ECS)", Default: true },
        { Name: "32768", Text: "32768 (STE/ECS enhanced)" },
        { Name: "262144", Text: "262144 (Falcon030)" },
        { Name: "16777216", Text: "16777216 (AGA/VGA)" },
      ],
      Action: function () {
        ProcessMenuAction(this.id.substring(this.id.lastIndexOf("_") + 1));
      },
    })
  );

  MenuDiv.appendChild(
    CreateMenuItem(ImageInfos.Id, {
      Type: "label",
      Name: "dither",
      Text: "Dither",
      Options: [
        { Name: "none", Text: "None", Default: true },
        { Name: "checks1", Text: "Checks (very low)" },
        { Name: "checks2", Text: "Checks (low)" },
        { Name: "checks3", Text: "Checks (medium)" },
        { Name: "checks4", Text: "Checks (high)" },
        { Name: "checks5", Text: "Checks (very high)" },
        { Name: "fs", Text: "Floyd-Steinberg" },
        { Name: "fs85", Text: "Floyd-Steinberg (85%)" },
        { Name: "fs75", Text: "Floyd-Steinberg (75%)" },
        //{ Name: "fs50", Text: "Floyd-Steinberg (50%)" },
        { Name: "ffs", Text: "False Floyd-Steinberg" },
        { Name: "jjn", Text: "Jarvis, Judice, and Ninke" },
        { Name: "s", Text: "Stucki" },
        { Name: "a", Text: "Atkinson" },
        { Name: "b", Text: "Burkes" },
        { Name: "s", Text: "Sierra" },
        { Name: "trs", Text: "Two-Row Sierra" },
        { Name: "sl", Text: "Sierra Lite" },
      ],
      Action: function () {
        ProcessMenuAction(this.id.substring(this.id.lastIndexOf("_") + 1));
      },
    })
  );
  /*
  MenuDiv.appendChild(CreateMenuItem(ImageInfos.Id,
    {
      Type: "label",
      Name: "remap",
      Text: "Remap",
      Options: [
        { Name: "rgb", Text: "RGB" },
        { Name: "rgbl", Text: "RGBL", Default: true } ],
      Action: function() { ProcessMenuAction(this.id.substring(this.id.lastIndexOf("_") + 1)); }
    }));

  MenuDiv.appendChild(CreateMenuItem(ImageInfos.Id,
    {
      Type: "label",
      Name: "format",
      Text: "Format",
      Options: [
        { Name: "pi1", Text: "PI1" },
        { Name: "iff", Text: "IFF" } ],
      Action: null
    }));
  */
  MenuDiv.appendChild(
    CreateMenuItem(ImageInfos.Id, {
      Type: "button",
      Name: "save",
      Text: "Save",
      Action: function () {
        SaveImage(this.id.substring(this.id.lastIndexOf("_") + 1));
      },
    })
  );

  ImageDiv.id = "image_div_" + ImageInfos.Id;
  ImageDiv.style.width = OriginalCanvas.style.width;
  ImageDiv.style.height = OriginalCanvas.style.height;

  ImageDiv.appendChild(OriginalCanvas);
  ImageDiv.appendChild(DisplayCanvas);

  ColorsDiv.id = "colors_div_" + ImageInfos.Id;
  ColorsDiv.style.width = OriginalCanvas.style.width;
  ColorsDiv.style.height = LineHeight;

  ColorsDiv.appendChild(ColorsCanvas);

  WindowDiv.appendChild(TitleBarDiv);
  WindowDiv.appendChild(MenuDiv);
  WindowDiv.appendChild(ImageDiv);
  WindowDiv.appendChild(ColorsDiv);

  return WindowDiv;
}

function CreateMenuItem(Id, Item) {
  var MenuItemDiv = document.createElement("div");

  MenuItemDiv.id = "menu_" + Item.Name + "_div_" + Id;
  MenuItemDiv.className = "menu_item_class";
  MenuItemDiv.style.height = LineHeight;

  switch (Item.Type) {
    case "label":
      var Label = document.createElement("label");
      var Select = document.createElement("select");

      Label.id = "menu_" + Item.Name + "_label_" + Id;
      Label.className = "menu_label_class";
      Label.style.height = LineHeight;
      //Label.innerHTML = Item.Text + ":";
      Label.htmlFor = "menu_" + Item.Name + "_select_" + Id;

      Select.id = "menu_" + Item.Name + "_select_" + Id;
      Select.className = "menu_select_class";
      Select.style.height = LineHeight;
      Select.addEventListener("change", Item.Action, false);

      for (var Index = 0; Index < Item.Options.length; Index++) {
        var Option = document.createElement("option");

        Option.id =
          "menu_" +
          Item.Name +
          "_" +
          Item.Options[Index].Name +
          "_option_" +
          Id;
        Option.className = "menu_option_class";
        Option.innerHTML = Item.Options[Index].Text;

        if (Item.Options[Index].Disabled) Option.disabled = true;

        if (localStorage) {
          if (localStorage.getItem("menu_" + Item.Name + "_select")) {
            if (
              localStorage.getItem("menu_" + Item.Name + "_select") ==
              Item.Options[Index].Text
            )
              Option.selected = true;
          } else if (Item.Options[Index].Default) {
            localStorage.setItem(
              "menu_" + Item.Name + "_select",
              Item.Options[Index].Text
            );
            Option.selected = true;
          }
        } else if (Item.Options[Index].Default) {
          Option.selected = true;
        }

        Select.appendChild(Option);
      }

      MenuItemDiv.appendChild(Label);
      MenuItemDiv.appendChild(Select);

      break;

    case "button":
      var Input = document.createElement("input");

      Input.id = "menu_" + Item.Name + "_input_" + Id;
      Input.className = "menu_input_class";
      Input.type = "button";
      Input.style.height = LineHeight;
      Input.value = Item.Text;
      Input.addEventListener("click", Item.Action, false);

      MenuItemDiv.appendChild(Input);

      break;

    case "checkbox":
      var Input = document.createElement("input");

      Input.id = "menu_" + Item.Name + "_input_" + Id;
      Input.className = "menu_input_class";
      Input.type = "checkbox";
      Input.style.height = LineHeight;
      Input.addEventListener("click", Item.Action, false);

      MenuItemDiv.appendChild(Input);

      var Label = document.createElement("label");

      Label.setAttribute("for", Input.id);
      //Label.innerHTML = Item.Text;

      MenuItemDiv.appendChild(Label);

      break;
  }

  return MenuItemDiv;
}

function ProcessMenuAction(Id) {
  document.getElementById("menu_global_colors_input_" + Id).checked = false;

  var ImageInfos = document.getElementById("window_div_" + Id).ImageInfos;

  ImageInfos.QuantizedColors = null;

  var DisplayCanvas = ResizeDisplayCanvas(Id, 0, 0, 0, 0);

  var ColorsSelection = document.getElementById(
    "menu_colors_select_" + Id
  ).value;
  var PaletteSelection = document.getElementById(
    "menu_palette_select_" + Id
  ).value;
  var DitherSelection = document.getElementById(
    "menu_dither_select_" + Id
  ).value;

  var PaletteColors = parseInt(
    PaletteSelection.substr(0, PaletteSelection.indexOf(" "))
  );

  if (localStorage) {
    localStorage.setItem("menu_colors_select", ColorsSelection);
    localStorage.setItem("menu_palette_select", PaletteSelection);
    localStorage.setItem("menu_dither_select", DitherSelection);
  }

  switch (ColorsSelection) {
    case "Original":
      ImageInfos.QuantizedColors = GetColors(DisplayCanvas);

      var RenderCanvas = document.createElement("canvas");

      RenderCanvas.width = ImageInfos.Image.width * 6;
      RenderCanvas.height = ImageInfos.Image.height * 6;

      var RenderContext =
        RenderCanvas.getContext("webgl") ||
        RenderCanvas.getContext("experimental-webgl");

      var FragmentShader = RenderContext.createShader(
        RenderContext.FRAGMENT_SHADER
      );

      RenderContext.shaderSource(
        FragmentShader,
        document.getElementById("fragment_shader3").text
      );
      RenderContext.compileShader(FragmentShader);

      var VertexShader = RenderContext.createShader(
        RenderContext.VERTEX_SHADER
      );

      RenderContext.shaderSource(
        VertexShader,
        document.getElementById("vertex_shader3").text
      );
      RenderContext.compileShader(VertexShader);

      var ShaderProgram = RenderContext.createProgram();

      RenderContext.attachShader(ShaderProgram, VertexShader);
      RenderContext.attachShader(ShaderProgram, FragmentShader);
      RenderContext.linkProgram(ShaderProgram);

      RenderContext.useProgram(ShaderProgram);

      // Create quad object as the render area.

      var QuadVertices = new Float32Array([
        -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0,
      ]);
      var QuadBuffer = RenderContext.createBuffer();

      RenderContext.bindBuffer(RenderContext.ARRAY_BUFFER, QuadBuffer);
      RenderContext.bufferData(
        RenderContext.ARRAY_BUFFER,
        QuadVertices,
        RenderContext.STATIC_DRAW
      );
      RenderContext.bindBuffer(RenderContext.ARRAY_BUFFER, null);

      // Get the Texture from the created canvas.

      var TextureImage = new Image();

      TextureImage.onload = function () {
        var ImageTexture = RenderContext.createTexture();

        RenderContext.bindTexture(RenderContext.TEXTURE_2D, ImageTexture);

        RenderContext.texParameteri(
          RenderContext.TEXTURE_2D,
          RenderContext.TEXTURE_WRAP_S,
          RenderContext.CLAMP_TO_EDGE
        );
        RenderContext.texParameteri(
          RenderContext.TEXTURE_2D,
          RenderContext.TEXTURE_WRAP_T,
          RenderContext.CLAMP_TO_EDGE
        );
        RenderContext.texParameteri(
          RenderContext.TEXTURE_2D,
          RenderContext.TEXTURE_MIN_FILTER,
          RenderContext.NEAREST
        );
        RenderContext.texParameteri(
          RenderContext.TEXTURE_2D,
          RenderContext.TEXTURE_MAG_FILTER,
          RenderContext.NEAREST
        );

        RenderContext.texImage2D(
          RenderContext.TEXTURE_2D,
          0,
          RenderContext.RGBA,
          RenderContext.RGBA,
          RenderContext.UNSIGNED_BYTE,
          TextureImage
        );

        RenderContext.clear(
          RenderContext.COLOR_BUFFER_BIT | RenderContext.DEPTH_BUFFER_BIT
        );

        var resolutionLocation = RenderContext.getUniformLocation(
          ShaderProgram,
          "iResolution"
        );

        RenderContext.uniform3f(
          resolutionLocation,
          TextureImage.width * 6,
          TextureImage.height * 6,
          0
        );

        var PositionLocation = RenderContext.getAttribLocation(
          ShaderProgram,
          "pos"
        );

        RenderContext.bindBuffer(RenderContext.ARRAY_BUFFER, QuadBuffer);
        RenderContext.vertexAttribPointer(
          PositionLocation,
          2,
          RenderContext.FLOAT,
          false,
          0,
          0
        );
        RenderContext.enableVertexAttribArray(PositionLocation);
        RenderContext.drawArrays(RenderContext.TRIANGLES, 0, 6);

        RenderContext.disableVertexAttribArray(PositionLocation);
        RenderContext.bindBuffer(RenderContext.ARRAY_BUFFER, null);

        UpdateImageWindow(Id);
      };

      TextureImage.src = ImageInfos.Image.currentSrc;

      RenderCanvas.id = "display_canvas_" + Id;
      RenderCanvas.className = "image_canvas_class";
      RenderCanvas.style.position = "absolute";
      RenderCanvas.style.width = TextureImage.width * 4;
      RenderCanvas.style.height = TextureImage.height * 4;

      document
        .getElementById("image_div_" + Id)
        .replaceChild(
          RenderCanvas,
          document.getElementById("display_canvas_" + Id)
        );

      UpdateImageWindow(Id);

      break;

    default:
      var DitherPattern = null;

      switch (DitherSelection) {
        case "Checks (very low)":
          DitherPattern = [1 * 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

          break;

        case "Checks (low)":
          DitherPattern = [2 * 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

          break;

        case "Checks (medium)":
          DitherPattern = [4 * 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

          break;

        case "Checks (high)":
          DitherPattern = [8 * 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

          break;

        case "Checks (very high)":
          DitherPattern = [16 * 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

          break;

        case "Floyd-Steinberg":
          DitherPattern = [
            0,
            0,
            0,
            7.0 / 16.0,
            0,
            0,
            3.0 / 16.0,
            5.0 / 16.0,
            1.0 / 16.0,
            0,
            0,
            0,
            0,
            0,
            0,
          ];

          break;

        case "Floyd-Steinberg (85%)":
          DitherPattern = [
            0,
            0,
            0,
            (7.0 * 0.85) / 16.0,
            0,
            0,
            (3.0 * 0.85) / 16.0,
            (5.0 * 0.85) / 16.0,
            (1.0 * 0.85) / 16.0,
            0,
            0,
            0,
            0,
            0,
            0,
          ];

          break;

        case "Floyd-Steinberg (75%)":
          DitherPattern = [
            0,
            0,
            0,
            (7.0 * 0.75) / 16.0,
            0,
            0,
            (3.0 * 0.75) / 16.0,
            (5.0 * 0.75) / 16.0,
            (1.0 * 0.75) / 16.0,
            0,
            0,
            0,
            0,
            0,
            0,
          ];

          break;

        case "Floyd-Steinberg (50%)":
          DitherPattern = [
            0,
            0,
            0,
            (7.0 * 0.5) / 16.0,
            0,
            0,
            (3.0 * 0.5) / 16.0,
            (5.0 * 0.5) / 16.0,
            (1.0 * 0.5) / 16.0,
            0,
            0,
            0,
            0,
            0,
            0,
          ];

          break;

        case "False Floyd-Steinberg":
          DitherPattern = [
            0,
            0,
            0,
            3.0 / 8.0,
            0,
            0,
            0,
            3.0 / 8.0,
            2.0 / 8.0,
            0,
            0,
            0,
            0,
            0,
            0,
          ];

          break;

        case "Jarvis, Judice, and Ninke":
          DitherPattern = [
            0,
            0,
            0,
            7.0 / 48.0,
            5.0 / 48.0,
            3.0 / 48.0,
            5.0 / 48.0,
            7.0 / 48.0,
            5.0 / 48.0,
            3.0 / 48.0,
            1.0 / 48.0,
            3.0 / 48.0,
            5.0 / 48.0,
            3.0 / 48.0,
            1.0 / 48.0,
          ];

          break;

        case "Stucki":
          DitherPattern = [
            0,
            0,
            0,
            8.0 / 42.0,
            4.0 / 42.0,
            2.0 / 42.0,
            4.0 / 42.0,
            8.0 / 42.0,
            4.0 / 42.0,
            2.0 / 42.0,
            1.0 / 42.0,
            2.0 / 42.0,
            4.0 / 42.0,
            2.0 / 42.0,
            1.0 / 42.0,
          ];

          break;

        case "Atkinson":
          DitherPattern = [
            0,
            0,
            0,
            1.0 / 8.0,
            1.0 / 8.0,
            0,
            1.0 / 8.0,
            1.0 / 8.0,
            1.0 / 8.0,
            0,
            0,
            0,
            1.0 / 8.0,
            0,
            0,
          ];

          break;

        case "Burkes":
          DitherPattern = [
            0,
            0,
            0,
            8.0 / 32.0,
            4.0 / 32.0,
            2.0 / 32.0,
            4.0 / 32.0,
            8.0 / 32.0,
            4.0 / 32.0,
            2.0 / 32.0,
            0,
            0,
            0,
            0,
            0,
          ];

          break;

        case "Sierra":
          DitherPattern = [
            0,
            0,
            0,
            5.0 / 32.0,
            3.0 / 32.0,
            2.0 / 32.0,
            4.0 / 32.0,
            5.0 / 32.0,
            4.0 / 32.0,
            2.0 / 32.0,
            0,
            2.0 / 32.0,
            3.0 / 32.0,
            2.0 / 32.0,
            0,
          ];

          break;

        case "Two-Row Sierra":
          DitherPattern = [
            0,
            0,
            0,
            4.0 / 16.0,
            3.0 / 16.0,
            1.0 / 16.0,
            2.0 / 16.0,
            3.0 / 16.0,
            2.0 / 16.0,
            1.0 / 16.0,
            0,
            0,
            0,
            0,
            0,
          ];

          break;

        case "Sierra Lite":
          DitherPattern = [
            0,
            0,
            0,
            2.0 / 4.0,
            0,
            0,
            1.0 / 4.0,
            1.0 / 4.0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
          ];

          break;
      }

      var BitsPerColor = 1;

      if (PaletteColors == 256) BitsPerColor = 332;
      else
        while (Math.pow(Math.pow(2, BitsPerColor), 3) < PaletteColors)
          BitsPerColor++;

      ProcessImage(
        ImageInfos,
        DisplayCanvas,
        ColorsSelection,
        BitsPerColor,
        "RGBL",
        DitherPattern,
        Id
      );

      break;
  }
}

function ProcessImage(
  ImageInfos,
  ImageCanvas,
  ColorCount,
  BitsPerColor,
  RemappingMethod,
  DitherPattern,
  Id
) {
  var EhbMode = false;
  var Colors = [];

  ImageInfos.SpectrumPalettes = null;

  if (ColorCount == "Global") {
    for (var Index = 0; Index < GlobalColors.length; Index++)
      Colors.push({
        Red: GlobalColors[Index].Red,
        Green: GlobalColors[Index].Green,
        Blue: GlobalColors[Index].Blue,
      });

    RemapImage(ImageCanvas, Colors, DitherPattern);
  } else if (ColorCount == "16 (ZX Spectrum)") {
    Colors.push({ Red: 0x00, Green: 0x00, Blue: 0x00 });
    Colors.push({ Red: 0x00, Green: 0x00, Blue: 0xcd });
    Colors.push({ Red: 0xcd, Green: 0x00, Blue: 0x00 });
    Colors.push({ Red: 0xcd, Green: 0x00, Blue: 0xcd });
    Colors.push({ Red: 0x00, Green: 0xcd, Blue: 0x00 });
    Colors.push({ Red: 0x00, Green: 0xcd, Blue: 0xcd });
    Colors.push({ Red: 0xcd, Green: 0xcd, Blue: 0x00 });
    Colors.push({ Red: 0xcd, Green: 0xcd, Blue: 0xcd });

    Colors.push({ Red: 0x00, Green: 0x00, Blue: 0x00 });
    Colors.push({ Red: 0x00, Green: 0x00, Blue: 0xff });
    Colors.push({ Red: 0xff, Green: 0x00, Blue: 0x00 });
    Colors.push({ Red: 0xff, Green: 0x00, Blue: 0xff });
    Colors.push({ Red: 0x00, Green: 0xff, Blue: 0x00 });
    Colors.push({ Red: 0x00, Green: 0xff, Blue: 0xff });
    Colors.push({ Red: 0xff, Green: 0xff, Blue: 0x00 });
    Colors.push({ Red: 0xff, Green: 0xff, Blue: 0xff });

    RemapImage(ImageCanvas, Colors, DitherPattern);

    UpdateImageWindow(Id);
  } else if (ColorCount.indexOf("PCHG") >= 0) {
    ColorCount = parseInt(ColorCount.substr(0, ColorCount.indexOf(" ")));

    var MaxRecursionDepth = 1;

    while (Math.pow(2, MaxRecursionDepth) < ColorCount) MaxRecursionDepth++;

    ImageInfos.LineColors = [ImageCanvas.height];

    var WorkerCounter = ImageCanvas.height;
    var TitleTextSpan = document.getElementById("title_text_span_" + Id);
    var OriginalTitleText = TitleTextSpan.innerHTML;

    for (var LineIndex = 0; LineIndex < ImageCanvas.height; LineIndex++) {
      var LineCanvas = document.createElement("canvas");

      LineCanvas.width = ImageCanvas.width;
      LineCanvas.height = 1;

      LineCanvas.getContext("2d").drawImage(
        ImageCanvas,
        0,
        LineIndex,
        ImageCanvas.width,
        1,
        0,
        0,
        ImageCanvas.width,
        1
      );

      var QuantizeWorker = new Worker("quantize.js");

      var QuantizeData = {
        LineIndex: LineIndex,
        CanvasData: LineCanvas.getContext("2d").getImageData(
          0,
          0,
          LineCanvas.width,
          LineCanvas.height
        ),
        MaxRecursionDepth: MaxRecursionDepth,
        BitsPerColor: BitsPerColor,
        ColorCount: ColorCount,
      };

      QuantizeWorker.addEventListener(
        "message",
        function (e) {
          ImageInfos.LineColors[e.data.LineIndex] = e.data.Colors;

          TitleTextSpan.innerHTML =
            "Processing... " +
            Math.round(
              ((ImageCanvas.height - WorkerCounter) * 100) / ImageCanvas.height
            ) +
            "%";

          WorkerCounter--;

          if (WorkerCounter == 0) {
            RemapLineColorsImage(
              ImageCanvas,
              ImageInfos.LineColors,
              DitherPattern
            );

            TitleTextSpan.innerHTML = OriginalTitleText;

            UpdateImageWindow(Id);
          }
        },
        false
      );

      QuantizeWorker.postMessage(QuantizeData);
    }

    return;
  } else if (ColorCount == "Spectrum 512/4k") {
    ImageCanvas = ResizeDisplayCanvas(
      Id,
      320,
      200,
      320 * 3 * DevicePixelRatio,
      200 * 3 * DevicePixelRatio
    );

    RemapSpectrum512Image3(
      ImageCanvas,
      ImageInfos,
      BitsPerColor,
      DitherPattern
    );

    // Save a copy of the render canvas for file saving.

    ImageInfos.SaveCanvas = document.createElement("canvas");

    ImageInfos.SaveCanvas.width = ImageCanvas.width;
    ImageInfos.SaveCanvas.height = ImageCanvas.height;
    ImageInfos.SaveCanvas.getContext("2d").drawImage(ImageCanvas, 0, 0);

    // CRT emulation.
    /*
    var RenderCanvas = document.createElement("canvas");

    RenderCanvas.width = 320 * 6;
    RenderCanvas.height = 200 * 6;

    var RenderContext = RenderCanvas.getContext("webgl") || RenderCanvas.getContext("experimental-webgl");

    var FragmentShader = RenderContext.createShader(RenderContext.FRAGMENT_SHADER);

    RenderContext.shaderSource(FragmentShader, document.getElementById("fragment_shader3").text);
    RenderContext.compileShader(FragmentShader);

    var VertexShader = RenderContext.createShader(RenderContext.VERTEX_SHADER);

    RenderContext.shaderSource(VertexShader, document.getElementById("vertex_shader3").text);
    RenderContext.compileShader(VertexShader);

    var ShaderProgram = RenderContext.createProgram();

    RenderContext.attachShader(ShaderProgram, VertexShader);
    RenderContext.attachShader(ShaderProgram, FragmentShader);
    RenderContext.linkProgram(ShaderProgram);

    RenderContext.useProgram(ShaderProgram);

    // Create quad object as the render area.

    var QuadVertices = new Float32Array([ -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0 ]);
    var QuadBuffer = RenderContext.createBuffer();

    RenderContext.bindBuffer(RenderContext.ARRAY_BUFFER, QuadBuffer);
    RenderContext.bufferData(RenderContext.ARRAY_BUFFER, QuadVertices, RenderContext.STATIC_DRAW);
    RenderContext.bindBuffer(RenderContext.ARRAY_BUFFER, null);

    // Get the Texture from the created canvas.

    var TextureImage = new Image();

    TextureImage.onload = function()
      {
        var ImageTexture = RenderContext.createTexture();

        RenderContext.bindTexture(RenderContext.TEXTURE_2D, ImageTexture);

        RenderContext.texParameteri(RenderContext.TEXTURE_2D, RenderContext.TEXTURE_WRAP_S, RenderContext.CLAMP_TO_EDGE);
        RenderContext.texParameteri(RenderContext.TEXTURE_2D, RenderContext.TEXTURE_WRAP_T, RenderContext.CLAMP_TO_EDGE);
        RenderContext.texParameteri(RenderContext.TEXTURE_2D, RenderContext.TEXTURE_MIN_FILTER, RenderContext.NEAREST);
        RenderContext.texParameteri(RenderContext.TEXTURE_2D, RenderContext.TEXTURE_MAG_FILTER, RenderContext.NEAREST);

        RenderContext.texImage2D(RenderContext.TEXTURE_2D, 0, RenderContext.RGBA, RenderContext.RGBA, RenderContext.UNSIGNED_BYTE, TextureImage);

        RenderContext.clear(RenderContext.COLOR_BUFFER_BIT | RenderContext.DEPTH_BUFFER_BIT);

        var resolutionLocation = RenderContext.getUniformLocation(ShaderProgram, "iResolution");

        RenderContext.uniform3f(resolutionLocation, RenderCanvas.width, RenderCanvas.height, 0);

        var PositionLocation = RenderContext.getAttribLocation(ShaderProgram, "pos");

        RenderContext.bindBuffer(RenderContext.ARRAY_BUFFER, QuadBuffer);
        RenderContext.vertexAttribPointer(PositionLocation, 2, RenderContext.FLOAT, false, 0, 0);
        RenderContext.enableVertexAttribArray(PositionLocation);
        RenderContext.drawArrays(RenderContext.TRIANGLES, 0, 6);

        RenderContext.disableVertexAttribArray(PositionLocation);
        RenderContext.bindBuffer(RenderContext.ARRAY_BUFFER, null);

        UpdateImageWindow(Id);
      };

    TextureImage.src = ImageCanvas.toDataURL("image/png");

    RenderCanvas.id = "display_canvas_" + Id;
    RenderCanvas.className = "image_canvas_class";
    RenderCanvas.style.position = "absolute";
    RenderCanvas.style.width = ImageCanvas.style.width;
    RenderCanvas.style.height = ImageCanvas.style.height;

    document.getElementById("image_div_" + Id).replaceChild(RenderCanvas, document.getElementById("display_canvas_" + Id));
*/
    UpdateImageWindow(Id);

    return;
  } else if (ColorCount == "NEOchrome Raster") {
    ImageCanvas = ResizeDisplayCanvas(
      Id,
      320,
      200,
      320 * 3 * DevicePixelRatio,
      200 * 3 * DevicePixelRatio
    );

    RemapNeochromeRasterImage2(
      ImageCanvas,
      ImageInfos,
      BitsPerColor,
      DitherPattern
    );

    // CRT emulation.
    /*
    var RenderCanvas = document.createElement("canvas");

    RenderCanvas.width = 320 * 6;
    RenderCanvas.height = 200 * 6;

    var RenderContext = RenderCanvas.getContext("webgl") || RenderCanvas.getContext("experimental-webgl");

    var FragmentShader = RenderContext.createShader(RenderContext.FRAGMENT_SHADER);

    RenderContext.shaderSource(FragmentShader, document.getElementById("fragment_shader3").text);
    RenderContext.compileShader(FragmentShader);

    var VertexShader = RenderContext.createShader(RenderContext.VERTEX_SHADER);

    RenderContext.shaderSource(VertexShader, document.getElementById("vertex_shader3").text);
    RenderContext.compileShader(VertexShader);

    var ShaderProgram = RenderContext.createProgram();

    RenderContext.attachShader(ShaderProgram, VertexShader);
    RenderContext.attachShader(ShaderProgram, FragmentShader);
    RenderContext.linkProgram(ShaderProgram);

    RenderContext.useProgram(ShaderProgram);

    // Create quad object as the render area.

    var QuadVertices = new Float32Array([ -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0 ]);
    var QuadBuffer = RenderContext.createBuffer();

    RenderContext.bindBuffer(RenderContext.ARRAY_BUFFER, QuadBuffer);
    RenderContext.bufferData(RenderContext.ARRAY_BUFFER, QuadVertices, RenderContext.STATIC_DRAW);
    RenderContext.bindBuffer(RenderContext.ARRAY_BUFFER, null);

    // Get the Texture from the created canvas.

    var TextureImage = new Image();

    TextureImage.onload = function()
      {
        var ImageTexture = RenderContext.createTexture();

        RenderContext.bindTexture(RenderContext.TEXTURE_2D, ImageTexture);

        RenderContext.texParameteri(RenderContext.TEXTURE_2D, RenderContext.TEXTURE_WRAP_S, RenderContext.CLAMP_TO_EDGE);
        RenderContext.texParameteri(RenderContext.TEXTURE_2D, RenderContext.TEXTURE_WRAP_T, RenderContext.CLAMP_TO_EDGE);
        RenderContext.texParameteri(RenderContext.TEXTURE_2D, RenderContext.TEXTURE_MIN_FILTER, RenderContext.NEAREST);
        RenderContext.texParameteri(RenderContext.TEXTURE_2D, RenderContext.TEXTURE_MAG_FILTER, RenderContext.NEAREST);

        RenderContext.texImage2D(RenderContext.TEXTURE_2D, 0, RenderContext.RGBA, RenderContext.RGBA, RenderContext.UNSIGNED_BYTE, TextureImage);

        RenderContext.clear(RenderContext.COLOR_BUFFER_BIT | RenderContext.DEPTH_BUFFER_BIT);

        var resolutionLocation = RenderContext.getUniformLocation(ShaderProgram, "iResolution");

        RenderContext.uniform3f(resolutionLocation, RenderCanvas.width, RenderCanvas.height, 0);

        var PositionLocation = RenderContext.getAttribLocation(ShaderProgram, "pos");

        RenderContext.bindBuffer(RenderContext.ARRAY_BUFFER, QuadBuffer);
        RenderContext.vertexAttribPointer(PositionLocation, 2, RenderContext.FLOAT, false, 0, 0);
        RenderContext.enableVertexAttribArray(PositionLocation);
        RenderContext.drawArrays(RenderContext.TRIANGLES, 0, 6);

        RenderContext.disableVertexAttribArray(PositionLocation);
        RenderContext.bindBuffer(RenderContext.ARRAY_BUFFER, null);

        UpdateImageWindow(Id);
      };

    TextureImage.src = ImageCanvas.toDataURL("image/png");

    RenderCanvas.id = "display_canvas_" + Id;
    RenderCanvas.className = "image_canvas_class";
    RenderCanvas.style.position = "absolute";
    RenderCanvas.style.width = ImageCanvas.style.width;
    RenderCanvas.style.height = ImageCanvas.style.height;

    document.getElementById("image_div_" + Id).replaceChild(RenderCanvas, document.getElementById("display_canvas_" + Id));
*/
    UpdateImageWindow(Id);

    return;
  } else if (ColorCount == "256 (8-8-4)") {
    for (var Red = 0; Red < 256; Red += 255.0 / 7.0)
      for (var Green = 0; Green < 256; Green += 255.0 / 7.0)
        for (var Blue = 0; Blue < 256; Blue += 255.0 / 3.0)
          Colors.push({
            Red: Math.round(Red),
            Green: Math.round(Green),
            Blue: Math.round(Blue),
          });

    RemapImage(ImageCanvas, Colors, DitherPattern);
  } else if (ColorCount == "Palette") {
    Colors.push({ Red: 0, Green: 0, Blue: 0 });
    Colors.push({ Red: 255, Green: 255, Blue: 255 });

    RemapImage(ImageCanvas, Colors, DitherPattern);
  } else {
    if (ColorCount == "64 (EHB)") {
      EhbMode = true;
      ColorCount = 32;
    }

    if (!ImageInfos.Colors || ImageInfos.Colors.length > ColorCount) {
      if (ColorCount == 2) {
        Colors.push({ Red: 0, Green: 0, Blue: 0 });
        Colors.push({ Red: 255, Green: 255, Blue: 255 });

        RemapImage(ImageCanvas, Colors, DitherPattern);

        UpdateImageWindow(Id);
      } else {
        /*
        var MaxRecursionDepth = 1;

        while(Math.pow(2, MaxRecursionDepth) < ColorCount)
          MaxRecursionDepth++;

        var QuantizeWorker = new Worker("quantize.js");

        var QuantizeData = { LineIndex: 0, CanvasData: ImageCanvas.getContext("2d").getImageData(0, 0, ImageCanvas.width, ImageCanvas.height), MaxRecursionDepth: MaxRecursionDepth, BitsPerColor: BitsPerColor, ColorCount: ColorCount };

        QuantizeWorker.addEventListener(
          "message",
          function(e)
          {
            ImageInfos.QuantizedColors = e.data.Colors;

            if(EhbMode)
            {
              while(ImageInfos.QuantizedColors.length < 64)
                ImageInfos.QuantizedColors.push({ Red: 0, Green: 0, Blue: 0 });

              for(var Index = 0; Index < 32; Index++)
              {
                var Red = ImageInfos.QuantizedColors[Index].Red;
                var Green = ImageInfos.QuantizedColors[Index].Green;
                var Blue = ImageInfos.QuantizedColors[Index].Blue;

                if(Math.max(Red, Green, Blue) >= 128)
                {
                  ImageInfos.QuantizedColors[Index + 32].Red = Math.floor(Red / 2.0);
                  ImageInfos.QuantizedColors[Index + 32].Green = Math.floor(Green / 2.0);
                  ImageInfos.QuantizedColors[Index + 32].Blue = Math.floor(Blue / 2.0);
                }
                else
                {
                  ImageInfos.QuantizedColors[Index + 32].Red = Red;
                  ImageInfos.QuantizedColors[Index + 32].Green = Green;
                  ImageInfos.QuantizedColors[Index + 32].Blue = Blue;

                  ImageInfos.QuantizedColors[Index].Red = Red * 2;
                  ImageInfos.QuantizedColors[Index].Green = Green * 2;
                  ImageInfos.QuantizedColors[Index].Blue = Blue * 2;
                }
              }
            }

            RemapImage(ImageCanvas, ImageInfos.QuantizedColors, DitherPattern);

            UpdateImageWindow(Id);
          },
          false);

        QuantizeWorker.postMessage(QuantizeData);
*/
        ImageInfos.QuantizedColors = QuantizeSimple(ImageCanvas, ColorCount);

        var ShadesPerColor = 1 << BitsPerColor;
        var ShadesScale = (ShadesPerColor - 1) / 255;
        var InverseShadesScale = 1 / ShadesScale;

        Colors = ImageInfos.QuantizedColors;

        for (var Index = 0; Index < Colors.length; Index++) {
          Colors[Index].Red = Math.round(
            Math.round(Colors[Index].Red * ShadesScale) * InverseShadesScale
          );
          Colors[Index].Green = Math.round(
            Math.round(Colors[Index].Green * ShadesScale) * InverseShadesScale
          );
          Colors[Index].Blue = Math.round(
            Math.round(Colors[Index].Blue * ShadesScale) * InverseShadesScale
          );
        }

        RemapImage(ImageCanvas, Colors, DitherPattern);

        UpdateImageWindow(Id);
      }

      return;
    } else {
      for (var Index = 0; Index < ImageInfos.Colors.length; Index++)
        Colors.push({
          Red: ImageInfos.Colors[Index].Red,
          Green: ImageInfos.Colors[Index].Green,
          Blue: ImageInfos.Colors[Index].Blue,
        });
    }

    if (BitsPerColor == "332") {
      for (var Index = 0; Index < Colors.length; Index++) {
        var ShadesScale = (8 - 1) / 255;
        var InverseShadesScale = 1 / ShadesScale;

        Colors[Index].Red = Math.round(
          Math.round(Colors[Index].Red * ShadesScale) * InverseShadesScale
        );
        Colors[Index].Green = Math.round(
          Math.round(Colors[Index].Green * ShadesScale) * InverseShadesScale
        );

        ShadesScale = (4 - 1) / 255;
        InverseShadesScale = 1 / ShadesScale;

        Colors[Index].Blue = Math.round(
          Math.round(Colors[Index].Blue * ShadesScale) * InverseShadesScale
        );
      }
    } else {
      var ShadesPerColor = 1 << BitsPerColor;

      for (var Index = 0; Index < Colors.length; Index++) {
        var ShadesScale = (ShadesPerColor - 1) / 255;
        var InverseShadesScale = 1 / ShadesScale;

        Colors[Index].Red = Math.round(
          Math.round(Colors[Index].Red * ShadesScale) * InverseShadesScale
        );
        Colors[Index].Green = Math.round(
          Math.round(Colors[Index].Green * ShadesScale) * InverseShadesScale
        );
        Colors[Index].Blue = Math.round(
          Math.round(Colors[Index].Blue * ShadesScale) * InverseShadesScale
        );
      }
    }
  }

  // Remap image.

  if (ColorCount == "16 (ZX Spectrum)") {
    RemapZxSpectrumImage1(ImageCanvas, Colors, DitherPattern);
  } else if (ColorCount == "Palette") {
    RemapFullPaletteImage(ImageCanvas, BitsPerColor, DitherPattern);
  }

  ImageInfos.QuantizedColors = Colors;

  UpdateImageWindow(Id);
}

function SaveImage(Id) {
  var ImageInfos = document.getElementById("window_div_" + Id).ImageInfos;
  var FormatSelection = "IFF"; //document.getElementById("menu_format_select_" + Id).value;
  var Canvas = document.getElementById("display_canvas_" + Id);
  var Colors;

  if (ImageInfos.SpectrumPalettes) {
    FormatSelection = "SPU";
  } else {
    if (ImageInfos.Colors) Colors = ImageInfos.Colors;
    else Colors = GetColors(Canvas);
  }

  switch (FormatSelection) {
    case "IFF":
      if (ImageInfos.LineColors)
        SaveIffPchg(ImageInfos, Canvas, ImageInfos.LineColors);
      else SaveIff(ImageInfos, Canvas, Colors);

      break;

    case "SPU":
      SaveSpu(ImageInfos);

      break;
  }
}

function SaveSpu(ImageInfos) {
  var Canvas = ImageInfos.SaveCanvas;
  var Palettes = ImageInfos.SpectrumPalettes;
  var BitsPerColor = ImageInfos.ConvertedBitsPerColor;

  var Data = new Uint8Array((320 * 200) / 2 + 16 * 2 * 3 * 199);

  var Context = Canvas.getContext("2d");
  var ImageData = Context.getImageData(0, 0, Canvas.width, Canvas.height);

  if (BitsPerColor == 5) {
    // Write "5BIT" marker.
    Data[0] = 53;
    Data[1] = 66;
    Data[2] = 73;
    Data[3] = 84;
  }

  for (
    var Y = 1;
    Y < Canvas.height;
    Y++ // Note: graphic data starts at the second line!
  ) {
    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * Canvas.width) * 4;

      var Red = ImageData.data[PixelIndex];
      var Green = ImageData.data[PixelIndex + 1];
      var Blue = ImageData.data[PixelIndex + 2];
      var Alpha = ImageData.data[PixelIndex + 3];

      if (Alpha == 255) {
        var ColorIndex;

        for (ColorIndex = 0; ColorIndex < 16; ColorIndex++) {
          var SlotColor = Palettes[Y][GetColorSlotIndex(X, ColorIndex)];

          if (
            SlotColor.Red == Red &&
            SlotColor.Green == Green &&
            SlotColor.Blue == Blue
          )
            break;
        }

        var WordDataIndex = (X >> 4) * 8 + (Y * 320) / 2;
        var BitIndex = X & 0xf;

        for (var PlaneIndex = 0; PlaneIndex < 4; PlaneIndex++) {
          var WordData =
            (Data[WordDataIndex + PlaneIndex * 2] << 8) |
            Data[WordDataIndex + PlaneIndex * 2 + 1];

          if (ColorIndex & (1 << PlaneIndex)) WordData |= 1 << (15 - BitIndex);

          Data[WordDataIndex + PlaneIndex * 2] = WordData >> 8;
          Data[WordDataIndex + PlaneIndex * 2 + 1] = WordData & 0xff;
        }
      }
    }
  }

  var DataIndex = (320 * 200) / 2;

  for (var PaletteIndex = 1; PaletteIndex < 200; PaletteIndex++) {
    for (var SlotIndex = 0; SlotIndex < 48; SlotIndex++) {
      var Red = Palettes[PaletteIndex][SlotIndex].Red;
      var Green = Palettes[PaletteIndex][SlotIndex].Green;
      var Blue = Palettes[PaletteIndex][SlotIndex].Blue;

      var ColorMask = BitsPerColor == 3 ? 0xe0 : 0xf0;
      var ColorWord =
        ((Red & ColorMask) << 4) |
        (Green & ColorMask) |
        ((Blue & ColorMask) >> 4);

      ColorWord = ((ColorWord & 0x111) << 3) | ((ColorWord & 0xeee) >> 1);
      ColorWord +=
        ((Red & 0x08) << 12) | ((Green & 0x08) << 11) | ((Blue & 0x08) << 10);

      Data[DataIndex++] = (ColorWord >> 8) & 0xff;
      Data[DataIndex++] = ColorWord & 0xff;
    }
  }

  // Save file.

  var DownloadLink = document.createElement("a");

  var FileName = ImageInfos.FileName.replace(".jpeg", ".spu")
    .replace(".jpg", ".spu")
    .replace(".png", ".spu")
    .replace(".gif", ".spu");

  DownloadLink.download = FileName;
  DownloadLink.innerHTML = "Download Image";
  /*
  if(window.webkitURL != null)
  {
    DownloadLink.href = window.webkitURL.createObjectURL(new Blob([Data], { type: "application/octet-binary" }));
  }
  else
*/
  {
    DownloadLink.href = URL.createObjectURL(
      new Blob([Data], { type: "application/octet-binary" })
    );
    DownloadLink.onclick = function (Event) {
      document.body.removeChild(Event.target);
    };
    DownloadLink.style.display = "none";
    document.body.appendChild(DownloadLink);
  }

  DownloadLink.click();
}

function WriteIffChunkHeader(Data, DataIndex, Id, Size) {
  for (var Index = 0; Index < Id.length; Index++)
    Data[DataIndex++] = Id.charCodeAt(Index);

  Data[DataIndex++] = (Size >> 24) & 0xff;
  Data[DataIndex++] = (Size >> 16) & 0xff;
  Data[DataIndex++] = (Size >> 8) & 0xff;
  Data[DataIndex++] = Size & 0xff;

  return DataIndex;
}

function SaveIff(ImageInfos, Canvas, Colors) {
  //alert(Colors.length);

  var NumberOfBitplanes = 1;

  while (1 << NumberOfBitplanes < Colors.length) NumberOfBitplanes++;

  var DataIndex = 0;
  var BytesPerLine = (Math.ceil(Canvas.width / 16) * 16) / 8;
  var DataSize = 4 + 4 + 4 + 4 + 4 + 20 + 4 + 4 + 4 + 4 + 22 + 4 + 4; // "FORM" + size + "ILBM" + "BMHD" + size + 20 + "CMAP" + size + "ANNO" + size + "http://tool.anides.de\0" + "BODY" + size.

  DataSize +=
    Colors.length * 3 +
    BytesPerLine * NumberOfBitplanes * Canvas.height +
    ((Colors.length * 3) & 1 ? 1 : 0);

  var Data = new Uint8Array(DataSize);

  // "FORM".

  DataIndex = WriteIffChunkHeader(Data, DataIndex, "FORM", DataSize - 8);

  for (var Index = 0; Index < 4; Index++)
    Data[DataIndex++] = "ILBM".charCodeAt(Index);

  // "BMHD".

  DataIndex = WriteIffChunkHeader(Data, DataIndex, "BMHD", 20);

  Data[DataIndex++] = (Canvas.width >> 8) & 0xff;
  Data[DataIndex++] = Canvas.width & 0xff;

  Data[DataIndex++] = (Canvas.height >> 8) & 0xff;
  Data[DataIndex++] = Canvas.height & 0xff;

  Data[DataIndex++] = 0;
  Data[DataIndex++] = 0;
  Data[DataIndex++] = 0;
  Data[DataIndex++] = 0;

  Data[DataIndex++] = NumberOfBitplanes;

  Data[DataIndex++] = 0;
  Data[DataIndex++] = 0;
  Data[DataIndex++] = 0;
  Data[DataIndex++] = 0;
  Data[DataIndex++] = 0;
  Data[DataIndex++] = 1;
  Data[DataIndex++] = 1;

  Data[DataIndex++] = (Canvas.width >> 8) & 0xff;
  Data[DataIndex++] = Canvas.width & 0xff;

  Data[DataIndex++] = (Canvas.height >> 8) & 0xff;
  Data[DataIndex++] = Canvas.height & 0xff;

  // "CMAP".

  DataIndex = WriteIffChunkHeader(Data, DataIndex, "CMAP", Colors.length * 3);

  for (var Index = 0; Index < Colors.length; Index++) {
    Data[DataIndex++] = Colors[Index].Red;
    Data[DataIndex++] = Colors[Index].Green;
    Data[DataIndex++] = Colors[Index].Blue;
  }

  if ((Colors.length * 3) & 1) Data[DataIndex++] = 0;

  // "ANNO".

  DataIndex = WriteIffChunkHeader(Data, DataIndex, "ANNO", 22);

  var AnnotationText = "http://tool.anides.de/"; // Fixed length!

  for (var Index = 0; Index < AnnotationText.length; Index++)
    Data[DataIndex++] = AnnotationText.charCodeAt(Index);

  // "BODY".

  DataIndex = WriteIffChunkHeader(
    Data,
    DataIndex,
    "BODY",
    BytesPerLine * NumberOfBitplanes * Canvas.height
  );

  var BitplaneLines = [NumberOfBitplanes];
  var Context = Canvas.getContext("2d");
  var ImageData = Context.getImageData(0, 0, Canvas.width, Canvas.height);

  for (var Y = 0; Y < Canvas.height; Y++) {
    for (var Index = 0; Index < NumberOfBitplanes; Index++)
      BitplaneLines[Index] = new Uint8Array(BytesPerLine);

    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * Canvas.width) * 4;

      var Red = ImageData.data[PixelIndex];
      var Green = ImageData.data[PixelIndex + 1];
      var Blue = ImageData.data[PixelIndex + 2];
      var Alpha = ImageData.data[PixelIndex + 3];

      var ColorIndex = 0;

      if (Alpha == 255)
        for (ColorIndex = 0; ColorIndex < Colors.length; ColorIndex++)
          if (
            Red == Colors[ColorIndex].Red &&
            Green == Colors[ColorIndex].Green &&
            Blue == Colors[ColorIndex].Blue
          )
            break;

      for (
        var BitplaneIndex = 0;
        BitplaneIndex < NumberOfBitplanes;
        BitplaneIndex++
      )
        if (ColorIndex & (1 << BitplaneIndex))
          BitplaneLines[BitplaneIndex][X >> 3] |= 0x80 >> (X & 7);
    }

    for (
      var BitplaneIndex = 0;
      BitplaneIndex < NumberOfBitplanes;
      BitplaneIndex++
    )
      for (var ByteIndex = 0; ByteIndex < BytesPerLine; ByteIndex++)
        Data[DataIndex++] = BitplaneLines[BitplaneIndex][ByteIndex];
  }

  // Save file.

  var DownloadLink = document.createElement("a");

  var FileName = ImageInfos.FileName.replace(".jpeg", ".iff")
    .replace(".jpg", ".iff")
    .replace(".png", ".iff")
    .replace(".gif", ".iff");

  DownloadLink.download = FileName;
  DownloadLink.innerHTML = "Download Image";
  /*
  if(window.webkitURL != null)
  {
    DownloadLink.href = window.webkitURL.createObjectURL(new Blob([Data], { type: "application/octet-binary" }));
  }
  else
*/
  {
    DownloadLink.href = URL.createObjectURL(
      new Blob([Data], { type: "application/octet-binary" })
    );
    DownloadLink.onclick = function (Event) {
      document.body.removeChild(Event.target);
    };
    DownloadLink.style.display = "none";
    document.body.appendChild(DownloadLink);
  }

  DownloadLink.click();
}

function SaveIffPchg(ImageInfos, Canvas, LineColors) {
  var Colors = LineColors[0];

  var NumberOfBitplanes = 1;

  while (1 << NumberOfBitplanes < Colors.length) NumberOfBitplanes++;

  var DataIndex = 0;
  var AdjustedImageWidth = Math.ceil(Canvas.width / 16) * 16;
  var BytesPerLine = AdjustedImageWidth / 8;
  var DataSize = 4 + 4 + 4 + 4 + 4 + 20 + 4 + 4 + 4 + 4 + 22 + 4 + 4; // "FORM" + size + "ILBM" + "BMHD" + size + 20 + "CMAP" + size + "ANNO" + size + "http://tool.anides.de\0" + "BODY" + size.

  DataSize +=
    Colors.length * 3 +
    BytesPerLine * NumberOfBitplanes * Canvas.height +
    ((Colors.length * 3) & 1 ? 1 : 0);
  DataSize += 4 + 4 + LineColors.length * (1 + Colors.length) * 2; // "RAST" + size + <raster data>.

  var Data = new Uint8Array(DataSize);

  // "FORM".

  DataIndex = WriteIffChunkHeader(Data, DataIndex, "FORM", DataSize - 8);

  for (var Index = 0; Index < 4; Index++)
    Data[DataIndex++] = "ILBM".charCodeAt(Index);

  // "BMHD".

  DataIndex = WriteIffChunkHeader(Data, DataIndex, "BMHD", 20);

  Data[DataIndex++] = (AdjustedImageWidth >> 8) & 0xff;
  Data[DataIndex++] = AdjustedImageWidth & 0xff;

  Data[DataIndex++] = (Canvas.height >> 8) & 0xff;
  Data[DataIndex++] = Canvas.height & 0xff;

  Data[DataIndex++] = 0;
  Data[DataIndex++] = 0;
  Data[DataIndex++] = 0;
  Data[DataIndex++] = 0;

  Data[DataIndex++] = NumberOfBitplanes;

  Data[DataIndex++] = 0;
  Data[DataIndex++] = 0;
  Data[DataIndex++] = 0;
  Data[DataIndex++] = 0;
  Data[DataIndex++] = 0;
  Data[DataIndex++] = 1;
  Data[DataIndex++] = 1;

  Data[DataIndex++] = (AdjustedImageWidth >> 8) & 0xff;
  Data[DataIndex++] = AdjustedImageWidth & 0xff;

  Data[DataIndex++] = (Canvas.height >> 8) & 0xff;
  Data[DataIndex++] = Canvas.height & 0xff;

  // "CMAP".

  DataIndex = WriteIffChunkHeader(Data, DataIndex, "CMAP", Colors.length * 3);

  for (var Index = 0; Index < Colors.length; Index++) {
    Data[DataIndex++] = Colors[Index].Red;
    Data[DataIndex++] = Colors[Index].Green;
    Data[DataIndex++] = Colors[Index].Blue;
  }

  if ((Colors.length * 3) & 1) Data[DataIndex++] = 0;

  // "ANNO".

  DataIndex = WriteIffChunkHeader(Data, DataIndex, "ANNO", 22);

  var AnnotationText = "http://tool.anides.de/"; // Fixed length!

  for (var Index = 0; Index < AnnotationText.length; Index++)
    Data[DataIndex++] = AnnotationText.charCodeAt(Index);

  // "BODY".

  DataIndex = WriteIffChunkHeader(
    Data,
    DataIndex,
    "BODY",
    BytesPerLine * NumberOfBitplanes * Canvas.height
  );

  var BitplaneLines = [NumberOfBitplanes];
  var Context = Canvas.getContext("2d");
  var ImageData = Context.getImageData(0, 0, Canvas.width, Canvas.height);

  for (var Y = 0; Y < Canvas.height; Y++) {
    Colors = LineColors[Y];

    for (var Index = 0; Index < NumberOfBitplanes; Index++)
      BitplaneLines[Index] = new Uint8Array(BytesPerLine);

    for (var X = 0; X < Canvas.width; X++) {
      var PixelIndex = (X + Y * Canvas.width) * 4;

      var Red = ImageData.data[PixelIndex];
      var Green = ImageData.data[PixelIndex + 1];
      var Blue = ImageData.data[PixelIndex + 2];
      var Alpha = ImageData.data[PixelIndex + 3];

      var ColorIndex = 0;

      if (Alpha == 255)
        for (ColorIndex = 0; ColorIndex < Colors.length; ColorIndex++)
          if (
            Red == Colors[ColorIndex].Red &&
            Green == Colors[ColorIndex].Green &&
            Blue == Colors[ColorIndex].Blue
          )
            break;

      for (
        var BitplaneIndex = 0;
        BitplaneIndex < NumberOfBitplanes;
        BitplaneIndex++
      )
        if (ColorIndex & (1 << BitplaneIndex))
          BitplaneLines[BitplaneIndex][X >> 3] |= 0x80 >> (X & 7);
    }

    for (
      var BitplaneIndex = 0;
      BitplaneIndex < NumberOfBitplanes;
      BitplaneIndex++
    )
      for (var ByteIndex = 0; ByteIndex < BytesPerLine; ByteIndex++)
        Data[DataIndex++] = BitplaneLines[BitplaneIndex][ByteIndex];
  }

  // "RAST".

  DataIndex = WriteIffChunkHeader(
    Data,
    DataIndex,
    "RAST",
    LineColors.length * (1 + Colors.length) * 2
  );

  for (var Y = 0; Y < LineColors.length; Y++) {
    Colors = LineColors[Y];

    Data[DataIndex++] = (Y >> 8) & 0xff;
    Data[DataIndex++] = Y & 0xff;

    for (var Index = 0; Index < Colors.length; Index++) {
      var ColorWord =
        ((Colors[Index].Red & 0xf0) << 4) |
        (Colors[Index].Green & 0xf0) |
        ((Colors[Index].Blue & 0xf0) >> 4);

      ColorWord = ((ColorWord & 0x111) << 3) | ((ColorWord & 0xeee) >> 1);

      Data[DataIndex++] = (ColorWord >> 8) & 0xff;
      Data[DataIndex++] = ColorWord & 0xff;
    }
  }

  // Save file.

  var DownloadLink = document.createElement("a");

  var FileName = ImageInfos.FileName.replace(".jpeg", ".iff")
    .replace(".jpg", ".iff")
    .replace(".png", ".iff")
    .replace(".gif", ".iff");

  DownloadLink.download = FileName;
  DownloadLink.innerHTML = "Download Image";
  /*
  if(window.webkitURL != null)
  {
    DownloadLink.href = window.webkitURL.createObjectURL(new Blob([Data], { type: "application/octet-binary" }));
  }
  else
*/
  {
    DownloadLink.href = URL.createObjectURL(
      new Blob([Data], { type: "application/octet-binary" })
    );
    DownloadLink.onclick = function (Event) {
      document.body.removeChild(Event.target);
    };
    DownloadLink.style.display = "none";
    document.body.appendChild(DownloadLink);
  }

  DownloadLink.click();
}

function SetGlobalColors(Element) {
  if (Element.checked) {
    var Id = Element.id.substring(Element.id.lastIndexOf("_") + 1);

    GlobalColors = document.getElementById("window_div_" + Id).ImageInfos
      .QuantizedColors;

    var WindowDivs = document.getElementById("dropzone").children;

    for (var Index = 0; Index < WindowDivs.length; Index++) {
      if (WindowDivs[Index].id.indexOf("window_div_") == 0) {
        var WindowId = WindowDivs[Index].id.substring(
          WindowDivs[Index].id.lastIndexOf("_") + 1
        );

        if (Id != WindowId) {
          document.getElementById(
            "menu_global_colors_input_" + WindowId
          ).checked = false;

          if (
            document.getElementById("menu_colors_select_" + WindowId).value ==
            "Global"
          )
            ProcessMenuAction(WindowId);
        }
      }
    }
  } else {
    GlobalColors = [];

    GlobalColors.push({ Red: 0, Green: 0, Blue: 0 });
    GlobalColors.push({ Red: 255, Green: 255, Blue: 255 });
  }
}
