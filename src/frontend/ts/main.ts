declare const M;

class Main implements EventListenerObject, HandleResponse {
  cargarGrilla(listaDisp: Array<Device>) {
    console.log("DEBUG INFO: received data from server", listaDisp);
    let cajaDips = document.getElementById("cajaDisp");
    let grilla: string = "<ul class='collection'>";
    for (let disp of listaDisp) {
      grilla += ` <li class="collection-item avatar">`;

      if (disp.type == 2) {
        grilla += `<img src="static/images/dimmer.webp" alt="" class="circle">`;
      } else {
        if (disp.type == 1) {
          grilla += `<img src="static/images/stepper.png" alt="" class="circle">`;
        } else {
          grilla += `<img src="static/images/switch.png" alt="" class="circle">`;
        }
      }

      grilla += ` <span class="title negrita">${disp.id} - ${disp.name}</span>
            <p>${disp.description}
            </p>
            <span>Estado actual: ${disp.state}
            </span>
            <button current-name="${disp.name}" current-description="${disp.description}" current-type="${disp.type}" id=edit_${disp.id} class="waves-effect right purple waves-light btn-small btnEdit"><i class="material-icons left">edit</i>Borrar</button>
            <button id=delete_${disp.id} class="waves-effect right purple waves-light btn-small btnDelete"><i class="material-icons left">delete</i>Editar</button>
            `;
      switch (disp.type) {
        case 0: {
          grilla += `<a href="#!" class="secondary-content">
          <div class="switch">
            <label>
                OFF`;
          if (disp.state) {
            grilla += `<input id="cb_${disp.id}" device-type="0" type="checkbox" checked>`;
          } else {
            grilla += `<input id="cb_${disp.id}" device-type="0" type="checkbox">`;
          }

          grilla += `
          <span class="lever"></span>
                        ON
                      </label>
            </div>
            </a>`;
          break;
        }
        case 1: {
          grilla += `
          <input class="right col s2" type="range" device-type="1" id="cb_${disp.id}" min="0" max="3" value=${disp.state} defaultValue=${disp.state} />
          `;
          break;
        }
        case 2: {
          grilla += `<input class="right col s2" type="range" device-type="2" id="cb_${disp.id}" min="0" max="1" step="0.01" value=${disp.state} defaultValue=${disp.state} />`;
          break;
        }
      }

      grilla += `</li>`;
    }
    grilla += "</ul>";

    cajaDips.innerHTML = grilla;

    for (let disp of listaDisp) {
      let cb = document.getElementById("cb_" + disp.id);
      let editBtn = document.getElementById("edit_" + disp.id);
      let deleteBtn = document.getElementById("delete_" + disp.id);
      cb.addEventListener("click", this);
      editBtn.addEventListener("click", this);
      deleteBtn.addEventListener("click", this);
    }

    this.framework.ocultarCargando();
  }

  private framework: Framework = new Framework();
  cosultarDispositivoAlServidor() {
    this.framework.getDevices(this);
  }

  initLoad() {
    this.cosultarDispositivoAlServidor();
  }

  cambiarEstadoDispositivoAlServidor(id: number, state: number) {
    this.framework.updateDeviceState(id, state);
  }

  handleEvent(event: Event): void {
    let tipoEvento: string = event.type;

    let object: HTMLElement;
    object = <HTMLElement>event.target;

    if (object.id == "btnDeviceAdd") {
      // Guardar dispositivo
      let new_name = (<HTMLInputElement>document.getElementById("new_name"))
        .value;
      let new_description = (<HTMLInputElement>(
        document.getElementById("new_description")
      )).value;
      let new_type = (<HTMLInputElement>document.getElementById("new_type"))
        .value;

      if (new_name && new_description && new_type) {
        this.framework.createDevice(
          new_name,
          new_description,
          parseInt(new_type),
          this
        );
        M.Modal.getInstance(
          <HTMLElement>document.getElementById("modal-add")
        ).close();
      }
    }

    if (object.id.startsWith("delete_")) {
      let idDisp = parseInt(object.id.substring(7));
      this.framework.deleteDevice(idDisp);
    }

    if (object.id.startsWith("edit_")) {
      let idDisp = parseInt(object.id.substring(5));
      let name = object.getAttribute("current-name");
      let description = object.getAttribute("current-description");
      let type = object.getAttribute("current-type");

      // Muestro el modal con los 3 atributos del device: name, description y type
      let editModal = M.Modal.getInstance(
        <HTMLElement>document.getElementById("modal-edit")
      );
      (<HTMLInputElement>document.getElementById("edit_name")).value = name;
      (<HTMLInputElement>document.getElementById("editedDeviceId")).value =
        object.id.substring(5);
      (<HTMLInputElement>document.getElementById("edit_description")).value =
        description;
      (<HTMLInputElement>(
        document.getElementsByClassName("edit-value")[parseInt(type)]
      )).setAttribute("selected", "selected");
      editModal.open();
    }

    if (object.id == "btnDeviceEdit") {
      let idDisp = (<HTMLInputElement>document.getElementById("editedDeviceId"))
        .value;
      // Guardar dispositivo
      let edit_name = (<HTMLInputElement>document.getElementById("edit_name"))
        .value;
      let edit_description = (<HTMLInputElement>(
        document.getElementById("edit_description")
      )).value;
      let edit_type = (<HTMLInputElement>document.getElementById("edit_type"))
        .value;

      let editedDevice = new Device(
        edit_name,
        edit_description,
        parseInt(edit_type)
      );

      if (edit_name && edit_description && edit_type) {
        this.framework.updateDevice(parseInt(idDisp), editedDevice, this);
        M.Modal.getInstance(
          <HTMLElement>document.getElementById("modal-edit")
        ).close();
      }
    }

    if (object.id.startsWith("cb_")) {
      let type: number = parseInt(object.getAttribute("device-type"));
      let input: HTMLInputElement;
      input = <HTMLInputElement>object;
      let idDisp = parseInt(object.id.substring(3));
      let newState = 0;
      switch (type) {
        case 0: {
          if (input.checked) newState = 1;
          this.cambiarEstadoDispositivoAlServidor(idDisp, newState);

          break;
        }
        case 1: {
          newState = Number(input.value);
          this.cambiarEstadoDispositivoAlServidor(idDisp, newState);
          break;
        }
        case 2: {
          newState = Number(input.value);
          this.cambiarEstadoDispositivoAlServidor(idDisp, newState);
          break;
        }
      }
    }
    this.cosultarDispositivoAlServidor();
  }

  public clearNewDeviceForm() {
    (<HTMLInputElement>document.getElementById("new_name")).value = "";
    (<HTMLInputElement>document.getElementById("new_description")).value = "";
    (<HTMLInputElement>document.getElementById("new_type")).value = "";
  }

  public clearEditDeviceForm() {
    (<HTMLInputElement>document.getElementById("edit_name")).value = "";
    (<HTMLInputElement>document.getElementById("edit_description")).value = "";
    (<HTMLInputElement>document.getElementById("edit_type")).value = "";
    (<HTMLInputElement>document.getElementById("editedDeviceId")).value = "";
  }
}

window.addEventListener("load", () => {
  let main: Main = new Main();
  main.initLoad();

  var elems = document.querySelectorAll("select");
  var instances = M.FormSelect.init(elems, "");

  M.updateTextFields();

  var elemsM = document.querySelectorAll(".modal");
  var instances = M.Modal.init(elemsM, "");

  let deviceAddBtn = document.getElementById("btnDeviceAdd");
  let btnDeviceEdit = document.getElementById("btnDeviceEdit");
  deviceAddBtn.addEventListener("click", main);
  btnDeviceEdit.addEventListener("click", main);
});
