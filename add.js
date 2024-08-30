import React, { useState } from 'react';
import { View, Button, Alert, Image, Text, PermissionsAndroid, Platform } from 'react-native';
import { RNCamera } from 'react-native-camera';
import AudioRecord from 'react-native-audio-record';
import CalendarEvents from 'react-native-calendar-events';
import Geolocation from 'react-native-geolocation-service';

const App = () => {
  const [camera, setCamera] = useState(null);
  const [photoUri, setPhotoUri] = useState('');
  const [location, setLocation] = useState(null);
  const [recording, setRecording] = useState(false);

  const requestPermissions = async () => {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.READ_CALENDAR,
    ];

    for (const permission of permissions) {
      await PermissionsAndroid.request(permission);
    }
  };

  const takePicture = async () => {
    if (camera) {
      const options = { quality: 0.5, base64: true };
      const data = await camera.takePictureAsync(options);
      setPhotoUri(data.uri);
      Alert.alert('Picture taken', data.uri);
    }
  };

  const startRecording = async () => {
    if (!recording) {
      setRecording(true);
      AudioRecord.init({
        sampleRate: 16000,
        channels: 1,
        bitsPerSample: 16,
        audioSource: 6,
        wavFile: 'test.wav',
      });
      const audioFile = await AudioRecord.start();
      Alert.alert('Recording started', audioFile);
    }
  };

  const stopRecording = async () => {
    if (recording) {
      const audioFile = await AudioRecord.stop();
      setRecording(false);
      Alert.alert('Recording stopped', audioFile);
    }
  };

  const fetchLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        Alert.alert('Location fetched', `Lat: ${latitude}, Lon: ${longitude}`);
      },
      (error) => {
        Alert.alert('Location error', error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchCalendarEvents = async () => {
    const events = await CalendarEvents.fetchAllEvents('2024-01-01', '2024-12-31');
    Alert.alert('Calendar Events', JSON.stringify(events));
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <RNCamera
        ref={(ref) => {
          setCamera(ref);
        }}
        style={{ flex: 1, width: '100%' }}
        type={RNCamera.Constants.Type.back}
        captureAudio={false}
      />
      <Button title="Take Picture" onPress={takePicture} />
      <Button title="Start Recording" onPress={startRecording} />
      <Button title="Stop Recording" onPress={stopRecording} />
      <Button title="Fetch Location" onPress={fetchLocation} />
      <Button title="Fetch Calendar Events" onPress={fetchCalendarEvents} />
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={{ width: 300, height: 300, marginTop: 10 }} />
      ) : null}
      {location && (
        <Text>Location: {JSON.stringify(location)}</Text>
      )}
    </View>
  );
};

export default App;
