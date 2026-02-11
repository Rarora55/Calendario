import { Pressable, PressableProps, Text, View, ViewStyle } from "react-native";

type Props = {
  title: string;
  subtitle: string;
  color?: string;
  textColor?: string;
  subtitleColor?: string;
  borderColor?: string;
  backgroundColor?: string;
  containerStyle?: ViewStyle;
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
  actionLabel = "Ver",
  onActionPress,
  dragHandleProps,
}: Props) {
  return (
    <View
      style={[
        {
          padding: 12,
          borderWidth: 1,
          borderRadius: 12,
          gap: 6,
          borderColor,
          backgroundColor,
        },
        containerStyle,
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {dragHandleProps ? (
          <Pressable
            {...dragHandleProps}
            style={[
              {
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: borderColor,
              },
              dragHandleProps.style,
            ]}
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
            onPress={onActionPress}
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
    </View>
  );
}
