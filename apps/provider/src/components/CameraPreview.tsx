import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { Camera as CameraIcon, RotateCcw, X } from 'lucide-react-native';

interface CameraPreviewProps {
  onCapture: (uri: string) => void;
  onClose: () => void;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({ onCapture, onClose }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState(CameraType.back);
  const cameraRef = useRef<Camera>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
        exif: true,
      });
      onCapture(photo.uri);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Solicitando permissão da câmera...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>Sem acesso à câmera.</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color="#fff" size={32} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => {
              setType(
                type === CameraType.back ? CameraType.front : CameraType.back
              );
            }}>
            <RotateCcw color="#fff" size={32} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureInternal}>
               <CameraIcon color="#064e3b" size={40} />
            </View>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
  },
  captureButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInternal: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButton: {
    position: 'absolute',
    bottom: 55,
    right: 30,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
});
