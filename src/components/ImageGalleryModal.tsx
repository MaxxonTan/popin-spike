import { Center, Heading, HStack, VStack, Pressable, useTheme } from 'native-base';
import React, { useEffect, useState } from 'react'
import { Modal } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { IImageInfo } from 'react-native-image-zoom-viewer/built/image-viewer.type';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen'
import Ionicons from 'react-native-vector-icons/Ionicons'
import ctw from '../../custom-tailwind';

interface ImageGalleryModalProps {
    showGallery: boolean,
    index: number,
    onCancel: () => void,
    photos: IImageInfo[]
}

/**
 * Display a photo gallery in a modal
 */
export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = (props) => {
    const [imageIndex, setImageIndex] = useState(0)
    const { colors } = useTheme()

    // if prop index changes, update the local one too
    useEffect(() => setImageIndex(props.index), [props.index])

    return (
        <Modal visible={props.showGallery} transparent={true} animationType="fade">
            <VStack flex={1} bg="primary.200">
                <HStack
                    width="100%" height="7%"
                    padding={2} alignItems="center" justifyContent="flex-start"
                    bg="shade.100"
                    style={{
                        shadowOffset: { width: 0, height: 0 },
                        shadowColor: 'black',
                        shadowOpacity: 1,
                        elevation: 4
                    }}
                >
                    <Pressable onPress={props.onCancel}>
                        {({ isPressed }) =>
                            <Ionicons name="close" style={{ color: isPressed ? colors['secondary']['500'] : colors['secondary']['400'] }} size={hp(5)} />
                        }
                    </Pressable>
                    <Heading marginLeft='auto' fontSize={hp(3)}>{imageIndex + 1}/{props.photos.length}</Heading>
                </HStack>
                <Center height="93%" width="100%">
                    <ImageViewer
                        imageUrls={props.photos}
                        backgroundColor="transparent"
                        style={ctw`w-11/12`}
                        enableSwipeDown
                        useNativeDriver
                        onCancel={props.onCancel}
                        renderIndicator={() => null}
                        index={props.index}
                        onChange={index => setImageIndex(index)}
                    />
                </Center>
            </VStack>
        </Modal>
    );
}