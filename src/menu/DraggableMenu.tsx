import { useTheme } from 'native-base';
import React from 'react'
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedGestureHandler, withSpring } from 'react-native-reanimated';
import { clamp } from 'react-native-redash';
import { useWindowDimensions } from 'react-native'

interface DraggableMenuProps {
    minHeight: number
    maxHeight: number
    snapPositionsInPercentage: number[]
}

export const DraggableMenu: React.FC<DraggableMenuProps> = (props) => {
    const { height } = useWindowDimensions()
    const { colors } = useTheme()

    const maxHeight = height - props.maxHeight
    const minHeight = props.minHeight
    const yMenu = useSharedValue(maxHeight)
    const yMenuSnapPositions = props.snapPositionsInPercentage.map((percent, index) => index === 0 ? minHeight : percent * maxHeight)
    const draggableMenuStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: yMenu.value }]
        }
    })
    const menuGestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx: any) => {
            ctx.startY = yMenu.value
        },
        onActive: (evt, ctx) => {
            let draggedVal = clamp(ctx.startY + evt.translationY, minHeight, maxHeight)
            yMenu.value = draggedVal
        },
        onEnd: () => {
            let closestVal = yMenuSnapPositions.reduce((a, b) => {
                return Math.abs(a - yMenu.value) > Math.abs(b - yMenu.value) ? b : a
            })
            yMenu.value = withSpring(closestVal, { stiffness: 200, damping: 20 })
        }
    })

    return (
        <PanGestureHandler onGestureEvent={menuGestureHandler} >
            <Animated.View
                style={[draggableMenuStyle, {
                    backgroundColor: colors['primary']['400'], height: height,
                    borderTopLeftRadius: 20, borderTopRightRadius: 20,
                    position: 'absolute', left: 0, right: 0
                }]}
            >
                {props.children}
            </Animated.View>
        </PanGestureHandler>
    );
}