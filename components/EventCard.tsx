import {
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  Text,
  View,
  ViewStyle,
} from "react-native";

type Props = {
  title: string;
  subtitle: string;
  color?: string;
  textColor?: string;
  subtitleColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  containerStyle?: ViewStyle;
  onPress?: () => void;
  actionLabel?: string;
  onActionPress?: () => void;
  dragHandleProps?: PressableProps;
};

export default function EventCard({
  title,
  subtitle,
  color = "#111",
  textColor = "#111",
  subtitleColor = "#6b7280",
  borderColor,
  backgroundColor,
  containerStyle,
  onPress,
  actionLabel = "Ver",
  onActionPress,
  dragHandleProps,
}: Props) {
  const dragHandleBaseStyle = {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: borderColor,
  };
  const dragHandleOriginalStyle = dragHandleProps?.style;
  const dragHandleStyle: PressableProps["style"] =
    typeof dragHandleOriginalStyle === "function"
      ? (state: PressableStateCallbackType) => [
          dragHandleBaseStyle,
          dragHandleOriginalStyle(state),
        ]
      : [dragHandleBaseStyle, dragHandleOriginalStyle];

  const content = (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {dragHandleProps ? (
          <Pressable
            {...dragHandleProps}
            style={dragHandleStyle}
          >
            <Text style={{ color: textColor, fontWeight: "700" }}>||</Text>
          </Pressable>
        ) : null}
        <View
          style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }}
        />
        <Text style={{ fontWeight: "700", color: textColor, flex: 1 }}>{title}</Text>
        {onActionPress ? (
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onActionPress();
            }}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: borderColor,
            }}
          >
            <Text style={{ color: textColor }}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={{ opacity: 0.7, color: subtitleColor }}>{subtitle}</Text>
    </>
  );

  const containerStyleValue = [
    {
      padding: 12,
      borderWidth: 1,
      borderRadius: 12,
      gap: 6,
      borderColor,
      backgroundColor,
    },
    containerStyle,
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={containerStyleValue}>
        {content}
      </Pressable>
    );
  }

  return <View style={containerStyleValue}>{content}</View>;
}
