declare const M;

class Main implements EventListenerObject, HandleResponse {

  private framework: Framework = new Framework();
  cosultarDispositivoAlServidor() {
    this.framework.getDevices(this);
  }

  cargarGrilla(listaDisp: Array<Device>) {
    console.log("DEBUG INFO: received data from server", listaDisp);
    let cajaDips = document.getElementById("cajaDisp");
    let grilla: string = "<ul class='collection'>";
    for (let disp of listaDisp) {
      grilla += ` <li class="collection-item avatar">
      <div class="col s6">
      `;

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
            </span></div>
            <div class="col s3 right">

            `;
      switch (disp.type) {
        case 0: {
          grilla += `<a href="#!">
          <div class="switch right">
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
          <p class="range-field">
          <input type="range" device-type="1" id="cb_${disp.id}" min="0" max="3" value=${disp.state} defaultValue=${disp.state} /></p>
          `;
          break;
        }
        case 2: {
          grilla += `
          <p class="range-field">
          <input type="range" device-type="2" id="cb_${disp.id}" min="0" max="1" step="0.01" value=${disp.state} defaultValue=${disp.state} /></p>`;
          break;
        }
      }

      grilla += `</div>
      <div class="col s6 right">
      <button current-name="${disp.name}" current-description="${disp.description}" current-type="${disp.type}" id=edit_${disp.id} class="waves-effect right purple waves-light btn-small btnEdit"><i class="material-icons left">edit</i>Editar</button>
      <button id=delete_${disp.id} class="waves-effect right purple waves-light btn-small btnDelete"><i class="material-icons left">delete</i>Borrar</button></div>
      </li>`;
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

      // Reinicializo inputs de select
      var elems = document.querySelectorAll("select");
      M.FormSelect.init(elems, "");

      // Reconfiguro inputs de range
      var elemesR = document.querySelectorAll("input[type=range]");
      M.Range.init(elemesR);
      
      // Reconfiguro labels de text inputs
      M.updateTextFields();


      }

  initLoad() {
    this.cosultarDispositivoAlServidor();
  }

  cambiarEstadoDispositivoAlServidor(id: number, state: number) {
    this.framework.updateDeviceState(id, state);
  }

  /* Tenemos 5 eventos:
   *   - presionar guardar en el modal de alta
   *   - presionar el botón de eliminar dispositivo
   *   - presionar guardar en el modal de edición
   *   - presionar el botón de editar dispositivo
   *   - presionar el botón para cambiar el estado del dispositivo
  */
  handleEvent(event: Event): void {

    let object: HTMLElement;
    object = <HTMLElement>event.target;

    if (object.id == "btnDeviceAdd") {
      // Guardar dispositivo
      let new_name = (<HTMLInputElement>document.getElementById("new_name")).value;
      let new_description = (<HTMLInputElement>(document.getElementById("new_description"))).value;
      let new_type = (<HTMLInputElement>document.getElementById("new_type")).value;

      if (new_name && new_description && new_type) {
        this.framework.createDevice(new_name, new_description, parseInt(new_type), this);
        M.Modal.getInstance(<HTMLElement>document.getElementById("modal-add")).close();
      }
    }

    if (object.id.startsWith("delete_")) {
      let idDisp = parseInt(object.id.substring(7));
      this.framework.deleteDevice(idDisp);
    }

    if (object.id.startsWith("edit_")) {
      let name = object.getAttribute("current-name");
      let description = object.getAttribute("current-description");
      let type = object.getAttribute("current-type");

      // Muestro el modal con los 3 atributos del device: name, description y type
      // Seteamos dentro del modal el ID del dispositivo a editar como un input escondido
      let editModal = M.Modal.getInstance(
        <HTMLElement>document.getElementById("modal-edit"));
      (<HTMLInputElement>document.getElementById("edit_name")).value = name;
      (<HTMLInputElement>document.getElementById("editedDeviceId")).value = object.id.substring(5);
      (<HTMLInputElement>document.getElementById("edit_description")).value = description;

      // TODO: revisar ya que no funciona 100% bien, setea el valor pero no lo muestra, ocurre un comportamiento extraño en el framework de CSS
      (<HTMLInputElement>(document.getElementsByClassName("edit-value")[parseInt(type)])).setAttribute("selected", "selected");
      editModal.open();
    }

    if (object.id == "btnDeviceEdit") {
      let idDisp = (<HTMLInputElement>document.getElementById("editedDeviceId")).value;
      // Guardar dispositivo
      let edit_name = (<HTMLInputElement>document.getElementById("edit_name")).value;
      let edit_description = (<HTMLInputElement>(document.getElementById("edit_description"))).value;
      let edit_type = (<HTMLInputElement>document.getElementById("edit_type")).value;

      let editedDevice = new Device(edit_name, edit_description, parseInt(edit_type));

      if (edit_name && edit_description && edit_type) {
        this.framework.updateDevice(parseInt(idDisp), editedDevice, this);
        M.Modal.getInstance(<HTMLElement>document.getElementById("modal-edit")).close();
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
        case 1: 
        case 2: {
          newState = Number(input.value);
          this.cambiarEstadoDispositivoAlServidor(idDisp, newState);
          break;
        }
      }
    }
    this.cosultarDispositivoAlServidor();
  }

  /* Esta función limpia el form del modal de creación */
  public clearNewDeviceForm() {
    (<HTMLInputElement>document.getElementById("new_name")).value = "";
    (<HTMLInputElement>document.getElementById("new_description")).value = "";
    (<HTMLInputElement>document.getElementById("new_type")).value = "";
  }

  /* Esta función limpia el form del modal de modificación */
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

  // Inicialización de selects
  var elems = document.querySelectorAll("select");
  M.FormSelect.init(elems, "");

  // Inicialización de range
  var elemesR = document.querySelectorAll("input[type=range]");
  M.Range.init(elemesR);

  M.updateTextFields();

  // Inicialización de modals
  var elemsM = document.querySelectorAll(".modal");
  M.Modal.init(elemsM, "");

  // Tenemos dos botones importantes, el botón del modal para agregar dispositivo, y el botón del modal para editar dispositivo 
  let deviceAddBtn = document.getElementById("btnDeviceAdd");
  let btnDeviceEdit = document.getElementById("btnDeviceEdit");
  deviceAddBtn.addEventListener("click", main);
  btnDeviceEdit.addEventListener("click", main);
});
