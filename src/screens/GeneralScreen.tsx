import EventCard from "@/components/EventCard";
import { CalendarEvent } from "@/src/domain/Event";
import { useAppStore } from "@/src/state/store";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTheme } from "@react-navigation/native";
import { Link, router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, Pressable, ScrollView, Text, View } from "react-native";

type BinArea = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type DraggableEventCardProps = {
    event: CalendarEvent;
    color?: string;
    textColor: string;
    subtitleColor: string;
    borderColor: string;
    isDragging: boolean;
    onPress: () => void;
    onDrop: (id: string) => void;
    isInBin: (x: number, y: number) => boolean;
    onDragStart: (id: string) => void;
    onDragEnd: () => void;
};

function DraggableEventCard({
    event,
    color,
    textColor,
    subtitleColor,
    borderColor,
    isDragging,
    onPress,
    onDrop,
    isInBin,
    onDragStart,
    onDragEnd,
}: DraggableEventCardProps) {
    const dragEnabledRef = useRef(false);
    const panActiveRef = useRef(false);
    const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pan = useRef(new Animated.ValueXY()).current;
    const clearLongPressTimer = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    };
    const startLongPressTimer = () => {
        clearLongPressTimer();
        longPressTimerRef.current = setTimeout(() => {
            dragEnabledRef.current = true;
            onDragStart(event.id);
        }, 300);
    };
    const stopDragIfNeeded = () => {
        clearLongPressTimer();
        if (dragEnabledRef.current && !panActiveRef.current) {
            dragEnabledRef.current = false;
            onDragEnd();
            Animated.spring(pan, {
                toValue: { x: 0, y: 0 },
                useNativeDriver: false,
            }).start();
        }
    };
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: () => dragEnabledRef.current,
            onMoveShouldSetPanResponderCapture: () => dragEnabledRef.current,
            onStartShouldSetPanResponderCapture: () => false,
            onPanResponderTerminationRequest: () => false,
            onPanResponderGrant: () => {
                panActiveRef.current = true;
            },
            onPanResponderMove: (_, gesture) => {
                if (!dragEnabledRef.current) return;
                pan.setValue({ x: gesture.dx, y: gesture.dy });
            },
            onPanResponderRelease: (_, gesture) => {
                clearLongPressTimer();
                if (dragEnabledRef.current && isInBin(gesture.moveX, gesture.moveY)) {
                    onDrop(event.id);
                }
                dragEnabledRef.current = false;
                panActiveRef.current = false;
                onDragEnd();
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                }).start();
            },
            onPanResponderTerminate: () => {
                clearLongPressTimer();
                dragEnabledRef.current = false;
                panActiveRef.current = false;
                onDragEnd();
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                }).start();
            },
        })
    ).current;

    return (
        <Animated.View
            onTouchStart={startLongPressTimer}
            onTouchEnd={stopDragIfNeeded}
            onTouchCancel={stopDragIfNeeded}
            {...panResponder.panHandlers}
            style={{
                transform: pan.getTranslateTransform(),
                zIndex: isDragging ? 20 : 2,
                elevation: isDragging ? 8 : 0,
            }}
        >
            <EventCard
                title={event.title}
                subtitle={new Date(event.startISO).toLocaleString()}
                color={color}
                textColor={textColor}
                subtitleColor={subtitleColor}
                borderColor={isDragging ? "#ef4444" : borderColor}
                backgroundColor={isDragging ? "rgba(239, 68, 68, 0.12)" : undefined}
                onPress={onPress}
                actionLabel="Ver"
                onActionPress={onPress}
            />
        </Animated.View>
    );
}

export default function GeneralScreen() {
    const { colors } = useTheme();
    const hydrated = useAppStore((s: any) => s.hydrated);
    const hydrate = useAppStore((s: any) => s.hydrate);
    const calendars = useAppStore((s: any) => s.calendars);
    const events = useAppStore((s: any) => s.events as CalendarEvent[]);
    const deleteEvent = useAppStore((s: any) => s.deleteEvent);

    const binRef = useRef<View>(null);
    const [binArea, setBinArea] = useState<BinArea | null>(null);
    const [draggingId, setDraggingId] = useState<string | null>(null);

    useEffect(() => {
        if (!hydrated) void hydrate();
    }, [hydrated, hydrate]);

    const generalEvents = useMemo(() => {
        const visibleIds = new Set(
            calendars.filter((c: any) => c.isVisible).map((c: any) => c.id)
        );

        return events
            .filter((e: CalendarEvent) => visibleIds.has(e.calendarId))
            .slice()
            .sort((a: CalendarEvent, b: CalendarEvent) =>
                a.startISO.localeCompare(b.startISO)
            );
    }, [calendars, events]);

    const calendarById = useMemo(() => {
        return new Map(calendars.map((c: any) => [c.id, c]));
    }, [calendars]);

    const updateBinArea = () => {
        requestAnimationFrame(() => {
            binRef.current?.measureInWindow((x, y, width, height) => {
                setBinArea({ x, y, width, height });
            });
        });
    };

    const isInBin = (x: number, y: number) => {
        if (!binArea) return false;
        return (
            x >= binArea.x &&
            x <= binArea.x + binArea.width &&
            y >= binArea.y &&
            y <= binArea.y + binArea.height
        );
    };

    useEffect(() => {
        if (hydrated) updateBinArea();
    }, [hydrated]);

    if (!hydrated) {
        return (
            <View style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
                <Text style={{ color: colors.text }}>Cargando...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 16, gap: 12, backgroundColor: colors.background }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>
                General
            </Text>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ gap: 12, paddingBottom: 12 }}
                scrollEnabled={!draggingId}
            >
                {generalEvents.map((e: CalendarEvent) => {
                    const cal = calendarById.get(e.calendarId);
                    const eventColor = e.color ?? (cal as { color?: string } | undefined)?.color;
                    return (
                        <DraggableEventCard
                            key={e.id}
                            event={e}
                            color={eventColor}
                            textColor={colors.text}
                            subtitleColor={colors.text}
                            borderColor={colors.border}
                            isDragging={draggingId === e.id}
                            onPress={() =>
                                router.push({ pathname: "/event/[id]", params: { id: e.id } })
                            }
                            onDrop={deleteEvent}
                            isInBin={isInBin}
                            onDragStart={(id) => {
                                updateBinArea();
                                setDraggingId(id);
                            }}
                            onDragEnd={() => setDraggingId(null)}
                        />
                    );
                })}
            </ScrollView>

            <View
                ref={binRef}
                collapsable={false}
                onLayout={updateBinArea}
                style={{
                    padding: 12,
                    borderWidth: 1,
                    borderRadius: 12,
                    borderColor: draggingId ? "#ef4444" : colors.border,
                    backgroundColor: draggingId ? "rgba(239, 68, 68, 0.12)" : "transparent",
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                }}
            >
                <FontAwesome
                    name="trash"
                    size={18}
                    color={draggingId ? "#ef4444" : colors.text}
                />
                <Text style={{ color: colors.text }}>Bin</Text>
            </View>

            <Link href="/day" asChild>
                <Pressable
                    style={{
                        padding: 14,
                        borderWidth: 1,
                        borderRadius: 12,
                        alignItems: "center",
                        borderColor: colors.border,
                    }}
                >
                    <Text style={{ color: colors.text }}>Abrir dia</Text>
                </Pressable>
            </Link>
        </View>
    );
}
