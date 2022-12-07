class Framework {
  backendURL = "http://localhost:8000";

  public getDevices(responseHandler: HandleResponse) {
    let xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState == 4) {
        if (xmlHttp.status == 200) {
          let listaDisp: Array<Device> = JSON.parse(xmlHttp.responseText);
          responseHandler.cargarGrilla(listaDisp);
        } else {
          this.mostrarAlerta("Hubo un error al comunicarse con el servidor: " + xmlHttp.status);
        }
      }
    };
    xmlHttp.open("GET", `${this.backendURL}/devices`, true);
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.send();
  }

  public updateDeviceState(id: number, data: number) {
    let xmlHttp = new XMLHttpRequest();
    let state = { state: data };
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState == 4) {
        if (xmlHttp.status == 200) {
          this.mostrarAlerta(`Dispositivo ${id} actualizado`);
          return;
        } else {
          this.mostrarAlerta("Hubo un error al comunicarse con el servidor:" + xmlHttp.status);
        }
      }
    };
    xmlHttp.open("POST", `${this.backendURL}/device/${id}/state`, true);
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.send(JSON.stringify(state));
  }

  public updateDevice(
    id: number,
    device: Device,
    responseHandler: HandleResponse
  ) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState == 4) {
        if (xmlHttp.status == 200) {
          this.mostrarAlerta(`Dispositivo ${id} modificado`);
          responseHandler.clearNewDeviceForm();
          return;
        } else {
          this.mostrarAlerta("Hubo un error al comunicarse con el servidor:" + xmlHttp.status);
        }
      }
    };
    xmlHttp.open("PUT", `${this.backendURL}/device/${id}`, true);
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.send(JSON.stringify(device));
  }

  public deleteDevice(id: number) {
    let xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState == 4) {
        if (xmlHttp.status == 200) {
          this.mostrarAlerta(`Dispositivo ${id} eliminado`);
          return;
        } else {
          this.mostrarAlerta("Hubo un error al comunicarse con el servidor: " + xmlHttp.status);
        }
      }
    };
    xmlHttp.open("DELETE", `${this.backendURL}/device/${id}`, true);
    xmlHttp.send();
  }

  public createDevice(name: string, description: string, type: number, responseHandler: HandleResponse) {
    let xmlHttp = new XMLHttpRequest();
    let device = new Device(name, description, type);
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState == 4) {
        if (xmlHttp.status == 200) {
          this.mostrarAlerta(`Dispositivo creado`);
          responseHandler.clearNewDeviceForm();
          return;
        } else {
          this.mostrarAlerta("Hubo un error al comunicarse con el servidor: " + xmlHttp.status);
        }
      }
    };
    xmlHttp.open("POST", `${this.backendURL}/device`, true);
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    xmlHttp.send(JSON.stringify(device));
  }

  public mostrarAlerta(message: string) {
    M.toast({ html: message });
  }

  public mostrarCargando() {
    let imgLoading = document.getElementById("loading");
    imgLoading.hidden = false;
  }

  public ocultarCargando() {
    let imgLoading = document.getElementById("loading");
    imgLoading.hidden = true;
  }
}
