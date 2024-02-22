import { Component } from '@angular/core';

import { DomSanitizer } from '@angular/platform-browser';

import ScanbotSdk, {
  DocumentScannerConfiguration,
  ScanbotSDKConfiguration,
} from 'cordova-plugin-scanbot-sdk';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  public SDK = ScanbotSdk.promisify!();
  constructor(private sanitizer: DomSanitizer) {
    this.initScanbotSdk();
   }

  isModalOpen = false;
  image: any;
  images: any[] = [];

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  public async initScanbotSdk() {
    alert('start');
    const config: ScanbotSDKConfiguration = {
      loggingEnabled: true, // Disable logging in production builds for security and performance reasons!
      licenseKey: '',
      storageImageFormat: 'JPG',
      storageImageQuality: 80,
      documentDetectorMode: 'ML_BASED',
      imageProcessorType: 'ML_BASED',
      //useCameraX: true,
      //allowXnnpackAcceleration: false,
      //allowGpuAcceleration: false,
    };

    const result = await this.SDK.initializeSdk(config);
    alert(JSON.stringify(result));
  }

  async startDocumentScanner() {

    const configs: DocumentScannerConfiguration = {
      // Customize colors, text resources, behavior, etc..
      cameraPreviewMode: 'FIT_IN',
      interfaceOrientation: 'PORTRAIT',
      pageCounterButtonTitle: '%d Page(s)',
      multiPageEnabled: true,
      ignoreBadAspectRatio: true,
      topBarBackgroundColor: '#c8193c',
      bottomBarBackgroundColor: '#c8193c',
      // see further configs ...
    };

    const result = await this.SDK.UI.startDocumentScanner({ uiConfigs: configs });

    if (result.status === 'CANCELED') {
      // user has canceled the scanning operation
      return;
    }

    for (let index = 0; index < result.pages.length; index++) {
      const page = result.pages[index];
      var resultFilter = await this.SDK.applyImageFilterOnPage({
        page,
        imageFilter: 'BLACK_AND_WHITE',
      });

      const filePath = resultFilter.page.documentImageFileUri;
      const fileUrl = Capacitor.convertFileSrc(filePath!);
      this.image = this.sanitizer.bypassSecurityTrustUrl(fileUrl);

      this.images.push(this.image);
    }

    this.isModalOpen = true;
  }
}
