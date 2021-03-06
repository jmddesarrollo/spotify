import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { UsuarioService } from '../../services/usuario.services';
import { AlbumService } from '../../services/album.service';
import { ArtistaService } from '../../services/artista.service';
import { CancionService } from '../../services/cancion.service';
import { UploadService } from '../../services/upload.service';
import { Usuario } from '../../models/usuario';
import { Album } from '../../models/album';
import { Artista } from '../../models/artista';
import { Cancion } from '../../models/cancion';
import { GLOBAL } from '../../services/global';

@Component({
  selector: 'app-album-detail',
  templateUrl: './album-detail.component.html',
  styleUrls: ['./album-detail.component.css'],
  providers: [UsuarioService, AlbumService, ArtistaService, CancionService, UploadService]
})

export class AlbumDetailComponent implements OnInit {
  public usuario: Usuario;
  public album: Album;
  public artista: Artista;
  public canciones: Cancion[];
  public identity;
  public token;
  public titulo: string;
  public mensajeAccion: string;
  public errorAccion: string;
  public url: string;
  public is_edit;
  public confirmado;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _usuarioService: UsuarioService,
    private _albumService: AlbumService,
    private _artistaService: ArtistaService,
    private _cancionService: CancionService,
    private _uploadService: UploadService
  ) {
    this.identity = this._usuarioService.getIdentity();
    this.token = this._usuarioService.getToken();
    this.url = GLOBAL.url;
    this.confirmado = null;
  }

  ngOnInit() {
    // Conseguir el album por su id.
    this.getAlbum();
  }

  getAlbum() {
    this._route.params.forEach((params: Params) => {
      let id = params['id'];

      this._albumService.getAlbum(this.token, id).subscribe(
        response => {
          if (response.album) {
            this.album = response.album;

            // Sacar las canciones asociadas al album
            this._cancionService.getCanciones(this.token, this.album.id).subscribe(
              response => {
                if (response.canciones) {
                  this.canciones = response.canciones;
                } else {
                  this.mensajeAccion = 'Este album no tiene canciones asociadas.';
                }
              },
              error => {
                this.errorAccion = <any>error;

                if (this.errorAccion) {
                  var body = JSON.parse(error._body);
                  this.errorAccion = body.mensaje;
                }
              }
            );

            // Sacar Artista
            this._artistaService.getArtista(this.token, this.album.artista_id).subscribe(
              response => {
                if (response.artista) {
                  this.artista = response.artista;
                }
              },
              error => {
                this.errorAccion = <any>error;

                if (this.errorAccion) {
                  var body = JSON.parse(error._body);
                  this.errorAccion = body.mensaje;
                }
              }
            );
          } else {
            this._router.navigate(['/']);
          }
        },
        error => {
          this.errorAccion = <any>error;

          if (this.errorAccion) {
            var body = JSON.parse(error._body);
            this.errorAccion = body.mensaje;
          }
        }
      );
    });
  }

  onDeleteConfirm(id) {
    this.confirmado = id;
  }

  onCancelCancion() {
    this.confirmado = null;
  }

  onDeleteCancion(id) {
    this._cancionService.delCancion(this.token, id).subscribe(
      response => {
        if (response.cancionId) {
          this.getAlbum();
        } else {
          alert('Error en la eliminación de la canción.');
        }
      },
      error => {
        this.errorAccion = <any>error;

        if (this.errorAccion) {
          var body = JSON.parse(error._body);
          this.errorAccion = body.mensaje;
        }
      }
    );
  }

  startPlayer(cancion) {
    let cancion_player = JSON.stringify(cancion);
    let file_path = this.url + 'get-cancion-archivo/' + cancion.archivo;
    let image_path = this.url + 'get-imagen-album/' + this.album.imagen;

    localStorage.setItem('sound_song', cancion_player);
    document.getElementById('mp3-source').setAttribute("src", file_path);
    (document.getElementById('player') as any).load();
    (document.getElementById('player') as any).play();

    document.getElementById('play-cancion-titulo').innerHTML = cancion.nombre;
    document.getElementById('play-cancion-artista').innerHTML = this.artista.nombre;
    document.getElementById('play-imagen-album').setAttribute('src', this.url + 'get-imagen-album/' + this.album.imagen);
  }
}

