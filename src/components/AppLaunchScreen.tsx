import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "@/src/theme/useAppTheme";

export default function AppLaunchScreen() {
    const { colors } = useAppTheme();
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.9)).current;
    const glowOpacity = useRef(new Animated.Value(0.15)).current;

    useEffect(() => {
        const enterAnimation = Animated.parallel([
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 450,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(logoScale, {
                toValue: 1,
                duration: 450,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]);

        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(logoScale, {
                    toValue: 1.06,
                    duration: 650,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(logoScale, {
                    toValue: 1,
                    duration: 650,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        const glowAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(glowOpacity, {
                    toValue: 0.35,
                    duration: 650,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(glowOpacity, {
                    toValue: 0.15,
                    duration: 650,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        enterAnimation.start(() => {
            pulseAnimation.start();
            glowAnimation.start();
        });

        return () => {
            pulseAnimation.stop();
            glowAnimation.stop();
        };
    }, [glowOpacity, logoOpacity, logoScale]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Animated.View style={[styles.glow, { backgroundColor: colors.primary, opacity: glowOpacity }]} />
            <Animated.Image
                source={require("../../assets/images/icon.png")}
                style={[
                    styles.logo,
                    {
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }],
                    },
                ]}
                resizeMode="contain"
            />
            <Text style={[styles.title, { color: colors.text }]}>Calendario</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
    },
    glow: {
        position: "absolute",
        width: 200,
        height: 200,
        borderRadius: 100,
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 28,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
});
