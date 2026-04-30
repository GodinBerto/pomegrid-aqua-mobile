import React, { useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import Svg, {
  Defs,
  G,
  Line,
  LinearGradient,
  Polygon,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { AppText, Card } from "@/components/ui";
import { formatNumber, type SetupType } from "@/lib/calculator";

type Point2D = {
  x: number;
  y: number;
};

type Point3D = {
  x: number;
  y: number;
  z: number;
};

type Face = {
  key: string;
  points: Point3D[];
  fill: string;
  opacity?: number;
  stroke?: string;
};

type PreviewPalette = {
  top: string;
  front: string;
  side: string;
  sideAlt: string;
  water: string;
  waterAlt: string;
  outline: string;
  ground: string;
  accent: string;
  label: string;
  description: string;
};

const STAGE_WIDTH = 360;
const STAGE_HEIGHT = 280;
const YAW = -34;
const PITCH = 24;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const lerp = (start: number, end: number, amount: number) => start + (end - start) * amount;

const buildRectLayer = (length: number, width: number, y: number): Point3D[] => {
  const halfLength = length / 2;
  const halfWidth = width / 2;

  return [
    { x: -halfLength, y, z: -halfWidth },
    { x: halfLength, y, z: -halfWidth },
    { x: halfLength, y, z: halfWidth },
    { x: -halfLength, y, z: halfWidth },
  ];
};

const rotatePoint = (point: Point3D, yawDegrees: number, pitchDegrees: number) => {
  const yaw = (yawDegrees * Math.PI) / 180;
  const pitch = (pitchDegrees * Math.PI) / 180;

  const yawX = point.x * Math.cos(yaw) + point.z * Math.sin(yaw);
  const yawZ = -point.x * Math.sin(yaw) + point.z * Math.cos(yaw);
  const pitchY = point.y * Math.cos(pitch) - yawZ * Math.sin(pitch);
  const pitchZ = point.y * Math.sin(pitch) + yawZ * Math.cos(pitch);

  return {
    x: yawX,
    y: pitchY,
    z: pitchZ,
  };
};

const projectPoint = (point: Point3D): Point2D => {
  const cameraDistance = 560;
  const perspective = cameraDistance / (cameraDistance - point.z);

  return {
    x: point.x * perspective,
    y: -point.y * perspective,
  };
};

const toPolygonPoints = (points: Point2D[]) => points.map((point) => `${point.x},${point.y}`).join(" ");

const createMeasurementLine = (start: Point2D, end: Point2D, offset: number, labelOffset = 18) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const normalX = -dy / length;
  const normalY = dx / length;

  return {
    start: {
      x: start.x + normalX * offset,
      y: start.y + normalY * offset,
    },
    end: {
      x: end.x + normalX * offset,
      y: end.y + normalY * offset,
    },
    label: {
      x: (start.x + end.x) / 2 + normalX * (offset + labelOffset),
      y: (start.y + end.y) / 2 + normalY * (offset + labelOffset),
    },
  };
};

const getPreviewPalette = (setupType: SetupType): PreviewPalette => {
  switch (setupType) {
    case "earthen-pond":
      return {
        top: "#B07A53",
        front: "#956340",
        side: "#795131",
        sideAlt: "#A87049",
        water: "#4AB3C7",
        waterAlt: "#BDF4F2",
        outline: "#17332F",
        ground: "#E4F0E1",
        accent: "#34563C",
        label: "Earthen Pond",
        description: "A sloped pond layout where surface area does most of the planning work.",
      };
    case "concrete-pond":
      return {
        top: "#BCC8D1",
        front: "#8E99A1",
        side: "#717C84",
        sideAlt: "#A8B3BA",
        water: "#42A3C1",
        waterAlt: "#C1EFF8",
        outline: "#24363A",
        ground: "#E8EEF1",
        accent: "#425259",
        label: "Concrete Pond",
        description: "A walled pond layout where water volume and steady exchange matter most.",
      };
    default:
      return {
        top: "#7CC8D7",
        front: "#55A9BE",
        side: "#3E90A5",
        sideAlt: "#6ABCCE",
        water: "#4FB7CA",
        waterAlt: "#D3FBFC",
        outline: "#123F49",
        ground: "#E3EFF3",
        accent: "#1F5866",
        label: "Tank",
        description: "A framed tank view for tighter stocking and more active water management.",
      };
  }
};

const DimensionPill = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-1 rounded-2xl border border-brand-line bg-white px-4 py-3">
    <AppText weight="semibold" className="text-xs uppercase tracking-[1.1px] text-brand-subtext">
      {label}
    </AppText>
    <AppText weight="bold" className="mt-1 text-base">
      {value}
    </AppText>
  </View>
);

export const TankSizePreview = ({
  setupType,
  length,
  width,
  depth,
}: {
  setupType: SetupType;
  length: number;
  width: number;
  depth: number;
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const palette = useMemo(() => getPreviewPalette(setupType), [setupType]);
  const cardWidth = Math.min(Math.max(windowWidth - 48, 280), STAGE_WIDTH);
  const hasValidDimensions = length > 0 && width > 0 && depth > 0;

  const preview = useMemo(() => {
    if (!hasValidDimensions) {
      return null;
    }

    const maxDimension = Math.max(length, width, depth, 1);
    const baseScale = 118 / maxDimension;
    const scaledLength = length * baseScale;
    const scaledWidth = width * baseScale;
    const scaledDepth = depth * baseScale;
    const topY = scaledDepth / 2;
    const bottomY = -scaledDepth / 2;

    let topLayer: Point3D[];
    let bottomLayer: Point3D[];
    let waterLayer: Point3D[];
    let platformLayer: Point3D[];

    if (setupType === "earthen-pond") {
      const topLength = scaledLength * 1.2 + 18;
      const topWidth = scaledWidth * 1.14 + 14;
      const bottomLength = Math.max(scaledLength * 0.72, topLength * 0.58);
      const bottomWidth = Math.max(scaledWidth * 0.68, topWidth * 0.56);
      const waterRatio = 0.74;
      const waterLevelY = lerp(bottomY, topY, waterRatio);
      const waterLength = Math.max(24, lerp(bottomLength, topLength, waterRatio) - 10);
      const waterWidth = Math.max(22, lerp(bottomWidth, topWidth, waterRatio) - 8);

      topLayer = buildRectLayer(topLength, topWidth, topY);
      bottomLayer = buildRectLayer(bottomLength, bottomWidth, bottomY);
      waterLayer = buildRectLayer(waterLength, waterWidth, waterLevelY);
      platformLayer = buildRectLayer(topLength * 1.65, topWidth * 1.55, topY + 10);
    } else if (setupType === "concrete-pond") {
      const outerLength = scaledLength * 1.04;
      const outerWidth = scaledWidth * 1.04;
      const innerLength = Math.max(22, outerLength - 14);
      const innerWidth = Math.max(22, outerWidth - 14);
      const waterLevelY = topY - Math.max(8, scaledDepth * 0.14);

      topLayer = buildRectLayer(outerLength, outerWidth, topY);
      bottomLayer = buildRectLayer(outerLength, outerWidth, bottomY);
      waterLayer = buildRectLayer(innerLength, innerWidth, waterLevelY);
      platformLayer = buildRectLayer(outerLength * 1.3, outerWidth * 1.24, topY + 10);
    } else {
      const topLength = scaledLength * 1.04;
      const topWidth = scaledWidth * 1.04;
      const bottomLength = topLength * 0.98;
      const bottomWidth = topWidth * 0.98;
      const waterLevelY = topY - Math.max(8, scaledDepth * 0.12);

      topLayer = buildRectLayer(topLength, topWidth, topY);
      bottomLayer = buildRectLayer(bottomLength, bottomWidth, bottomY);
      waterLayer = buildRectLayer(Math.max(20, topLength - 12), Math.max(20, topWidth - 12), waterLevelY);
      platformLayer = buildRectLayer(topLength * 1.34, topWidth * 1.26, bottomY - 18);
    }

    const faces: Face[] = [
      {
        key: "back",
        points: [bottomLayer[0], bottomLayer[1], topLayer[1], topLayer[0]],
        fill: palette.sideAlt,
      },
      {
        key: "left",
        points: [bottomLayer[0], bottomLayer[3], topLayer[3], topLayer[0]],
        fill: palette.side,
      },
      {
        key: "right",
        points: [bottomLayer[1], bottomLayer[2], topLayer[2], topLayer[1]],
        fill: palette.sideAlt,
      },
      {
        key: "front",
        points: [bottomLayer[3], bottomLayer[2], topLayer[2], topLayer[3]],
        fill: palette.front,
      },
    ];

    const transformPoint = (point: Point3D) => {
      const rotated = rotatePoint(point, YAW, PITCH);
      const projected = projectPoint(rotated);

      return {
        x: projected.x + STAGE_WIDTH / 2,
        y: projected.y + STAGE_HEIGHT / 2 + 14,
        z: rotated.z,
      };
    };

    const projectedPlatform = platformLayer.map(transformPoint);
    const projectedTop = topLayer.map(transformPoint);
    const projectedBottom = bottomLayer.map(transformPoint);
    const projectedWater = waterLayer.map(transformPoint);
    const projectedFaces = faces
      .map((face) => {
        const projected = face.points.map(transformPoint);
        const depthValue = projected.reduce((sum, point) => sum + point.z, 0) / projected.length;

        return {
          ...face,
          depthValue,
          points: projected,
        };
      })
      .sort((left, right) => left.depthValue - right.depthValue);

    const lengthLine = createMeasurementLine(projectedTop[3], projectedTop[2], 18);
    const widthLine = createMeasurementLine(projectedTop[2], projectedTop[1], 18);
    const depthLine = createMeasurementLine(projectedTop[3], projectedBottom[3], -18, 14);

    return {
      platformPoints: projectedPlatform,
      topPoints: projectedTop,
      bottomPoints: projectedBottom,
      waterPoints: projectedWater,
      faces: projectedFaces,
      lengthLine,
      widthLine,
      depthLine,
    };
  }, [depth, hasValidDimensions, length, palette.front, palette.side, palette.sideAlt, setupType, width]);

  if (!hasValidDimensions || !preview) {
    return (
      <Card className="gap-3">
        <AppText weight="bold" className="text-xl">
          Pond preview
        </AppText>
        <View className="rounded-[28px] border border-dashed border-brand-line bg-secondary px-5 py-10">
          <AppText className="text-center text-sm leading-6 text-brand-subtext">
            Enter a valid length, width, and depth to generate a size preview.
          </AppText>
        </View>
      </Card>
    );
  }

  return (
    <Card className="gap-4 overflow-hidden p-0">
      <View className="gap-2 bg-secondary px-5 pb-4 pt-5">
        <AppText weight="bold" className="text-xl">
          Pond preview
        </AppText>
        <AppText className="text-sm leading-6 text-brand-subtext">{palette.description}</AppText>
      </View>

      <View className="px-4 pb-5 pt-1">
        <View
          className="self-center overflow-hidden rounded-[28px] border border-brand-line bg-white"
          style={{ width: cardWidth }}
        >
          <Svg
            width={cardWidth}
            height={(cardWidth / STAGE_WIDTH) * STAGE_HEIGHT}
            viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
          >
            <Defs>
              <LinearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={palette.waterAlt} />
                <Stop offset="100%" stopColor={palette.water} />
              </LinearGradient>
              <LinearGradient id="groundGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#FFFFFF" />
                <Stop offset="100%" stopColor={palette.ground} />
              </LinearGradient>
            </Defs>

            <Rect x="0" y="0" width={STAGE_WIDTH} height={STAGE_HEIGHT} fill="url(#groundGradient)" />
            <Rect x="18" y="18" width="112" height="28" rx="14" fill="#FFFFFF" opacity="0.92" />
            <SvgText x="74" y="36" textAnchor="middle" fontSize="11" fontWeight="700" fill={palette.accent}>
              {palette.label}
            </SvgText>

            <G opacity="0.95">
              <Polygon points={toPolygonPoints(preview.platformPoints)} fill={palette.ground} stroke={palette.outline} strokeOpacity="0.12" />

              {preview.faces.map((face) => (
                <Polygon
                  key={face.key}
                  points={toPolygonPoints(face.points)}
                  fill={face.fill}
                  fillOpacity={face.opacity ?? 0.96}
                  stroke={face.stroke ?? palette.outline}
                  strokeOpacity="0.26"
                />
              ))}

              <Polygon points={toPolygonPoints(preview.topPoints)} fill={palette.top} fillOpacity="0.82" stroke={palette.outline} strokeOpacity="0.2" />
              <Polygon points={toPolygonPoints(preview.waterPoints)} fill="url(#waterGradient)" fillOpacity="0.92" stroke={palette.outline} strokeOpacity="0.18" />
            </G>

            {[preview.lengthLine, preview.widthLine, preview.depthLine].map((line, index) => (
              <G key={String(index)}>
                <Line
                  x1={line.start.x}
                  y1={line.start.y}
                  x2={line.end.x}
                  y2={line.end.y}
                  stroke={palette.accent}
                  strokeWidth="2"
                  strokeDasharray="6 5"
                />
                <Rect x={line.start.x - 2} y={line.start.y - 2} width="4" height="4" rx="2" fill={palette.accent} />
                <Rect x={line.end.x - 2} y={line.end.y - 2} width="4" height="4" rx="2" fill={palette.accent} />
              </G>
            ))}

            <SvgText
              x={preview.lengthLine.label.x}
              y={preview.lengthLine.label.y}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill={palette.accent}
            >
              {`L: ${formatNumber(length)} m`}
            </SvgText>
            <SvgText
              x={preview.widthLine.label.x}
              y={preview.widthLine.label.y}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill={palette.accent}
            >
              {`W: ${formatNumber(width)} m`}
            </SvgText>
            <SvgText
              x={preview.depthLine.label.x}
              y={preview.depthLine.label.y}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill={palette.accent}
            >
              {`D: ${formatNumber(depth)} m`}
            </SvgText>
          </Svg>
        </View>

        <View className="mt-4 flex-row gap-3">
          <DimensionPill label="Length" value={`${formatNumber(length)} m`} />
          <DimensionPill label="Width" value={`${formatNumber(width)} m`} />
          <DimensionPill label="Depth" value={`${formatNumber(depth)} m`} />
        </View>
      </View>
    </Card>
  );
};
