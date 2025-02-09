fetch('/api/config')
  .then(response => response.json())
  .then(config => {
      const firebaseConfig = {
          apiKey: config.apiKey,
          authDomain: config.authDomain,
          databaseURL: config.databaseURL,
          projectId: config.projectId,
          storageBucket: config.storageBucket,
          messagingSenderId: config.messagingSenderId,
          appId: config.appId,
          measurementId: config.measurementId
      };

      // Khởi tạo Firebase
      firebase.initializeApp(firebaseConfig);
  })
  .catch(error => console.error("Lỗi tải config:", error));