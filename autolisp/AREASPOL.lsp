;;; ==========================================================================
;;; AREASPOL.lsp
;;; --------------------------------------------------------------------------
;;; Comando: AREASPOL
;;;
;;; Selecciona TODAS las polilineas cerradas (LWPOLYLINE) de una capa concreta,
;;; calcula su superficie, la redondea segun la tabla Bluespace y coloca en el
;;; centro de cada una un TEXTO con el numero (sin "m2").
;;;
;;; Ademas, cada texto se coloca en una CAPA distinta segun el valor redondeado,
;;; siguiendo el mapa "boxs_texts_layer_names" del archivo config.yml.
;;; Si la capa de destino no existe, se crea automaticamente.
;;;
;;; Uso:
;;;   1. En AutoCAD escribe:  APPLOAD  y carga este archivo.
;;;   2. Ejecuta el comando:  AREASPOL
;;;   3. Escribe el nombre EXACTO de la capa de las polilineas.
;;;   4. Indica la altura del texto (Enter = 0.25).
;;;
;;; Nota sobre unidades:
;;;   El codigo supone que el dibujo esta en METROS. Si dibujas en MILIMETROS,
;;;   descomenta la linea marcada mas abajo para dividir el area entre 1000000.
;;; ==========================================================================

;;; --------------------------------------------------------------------------
;;; Redondeo segun tabla Bluespace (box_target_areas)
;;;   Devuelve el valor "mostrado" a partir del area real.
;;;   Mas de 22 m2 -> 25.
;;; --------------------------------------------------------------------------
(defun BS-RedondearArea (area)
  (cond
    ((<= area 1.25)  1.0)
    ((<= area 1.75)  1.5)
    ((<= area 2.25)  2.0)
    ((<= area 2.75)  2.5)
    ((<= area 3.25)  3.0)
    ((<= area 3.75)  3.5)
    ((<= area 4.40)  4.0)
    ((<= area 4.60)  4.5)
    ((<= area 5.40)  5.0)
    ((<= area 6.50)  6.0)
    ((<= area 7.50)  7.0)
    ((<= area 8.50)  8.0)
    ((<= area 9.50)  9.0)
    ((<= area 11.50) 10.0)
    ((<= area 13.50) 12.0)
    ((<= area 16.50) 15.0)
    ((<= area 19.50) 18.0)
    ((<= area 22.00) 21.0)
    (T 25.0)
  )
)

;;; --------------------------------------------------------------------------
;;; Capa de destino segun el area (boxs_texts_layer_names)
;;;   Usa los mismos umbrales que BS-RedondearArea.
;;; --------------------------------------------------------------------------
(defun BS-CapaPorArea (area)
  (cond
    ((<= area 1.25)  "BS-61-S-1.0 sqm")
    ((<= area 1.75)  "BS-61-S-1.5 sqm")
    ((<= area 2.25)  "BS-61-S-2.0 sqm")
    ((<= area 2.75)  "BS-61-S-2.5 sqm")
    ((<= area 3.25)  "BS-61-S-3.0 sqm")
    ((<= area 3.75)  "BS-61-S-3.5 sqm")
    ((<= area 4.40)  "BS-62-M-4.0 sqm")
    ((<= area 4.60)  "BS-62-M-4.5 sqm")
    ((<= area 5.40)  "BS-62-M-5.0 sqm")
    ((<= area 6.50)  "BS-62-M-6.0 sqmm")   ; (nombre tal cual en el config.yml)
    ((<= area 7.50)  "BS-62-M-7.0 sqm")
    ((<= area 8.50)  "BS-62-M-8.0 sqm")
    ((<= area 9.50)  "BS-62-M-9.0 sqm")
    ((<= area 11.50) "BS-63-L-10.0 sqm")
    ((<= area 13.50) "BS-63-L-12.0 sqm")
    ((<= area 16.50) "BS-63-L-15.0 sqm")
    ((<= area 19.50) "BS-63-L-18.0 sqm")
    ((<= area 22.00) "BS-64-XL-21.0 sqm")
    (T               "BS-64-XL-25.0 sqm")
  )
)

;;; --------------------------------------------------------------------------
;;; Formato del numero
;;;   Enteros sin decimales (4 -> "4"), medios con un decimal (4.5 -> "4.5").
;;; --------------------------------------------------------------------------
(defun BS-FormatoArea (area)
  (if (= area (fix area))
    (rtos area 2 0)
    (rtos area 2 1)
  )
)

;;; --------------------------------------------------------------------------
;;; Asegura que una capa existe (la crea si hace falta) y devuelve su nombre.
;;; --------------------------------------------------------------------------
(defun BS-AsegurarCapa (nombre doc)
  (if (vl-catch-all-error-p
        (vl-catch-all-apply 'vla-Item (list (vla-get-Layers doc) nombre)))
    (vla-Add (vla-get-Layers doc) nombre)
  )
  nombre
)

;;; --------------------------------------------------------------------------
;;; Comando principal
;;; --------------------------------------------------------------------------
(defun c:AREASPOL
  (/ capa altura ss i obj area-real area-redondeada capa-destino
     minPt maxPt centro texto doc espacio)

  (vl-load-com)
  (setq doc (vla-get-ActiveDocument (vlax-get-acad-object)))
  (setq espacio
    (if (= 1 (getvar "CVPORT"))
      (vla-get-PaperSpace doc)
      (vla-get-ModelSpace doc)
    )
  )

  ;; Nombre de la capa donde estan las polilineas
  (setq capa
    (getstring T "\nEscribe el nombre de la capa de las polilineas: ")
  )

  ;; Altura del texto (Enter = 0.25)
  (setq altura (getdist "\nIndica la altura del texto <0.25>: "))
  (if (null altura)
    (setq altura 0.25)
  )

  ;; Seleccionar todas las polilineas cerradas de la capa indicada
  (setq ss
    (ssget "_X"
      (list
        '(0 . "LWPOLYLINE")
        (cons 8 capa)
        '(-4 . "&")
        '(70 . 1)
      )
    )
  )

  (if ss
    (progn
      (setq i 0)
      (repeat (sslength ss)
        (setq obj (vlax-ename->vla-object (ssname ss i)))

        ;; Area geometrica real
        (setq area-real (vla-get-Area obj))
        ;; --- Si el dibujo esta en MILIMETROS, descomenta la linea siguiente: ---
        ;; (setq area-real (/ (vla-get-Area obj) 1000000.0))

        ;; Valor redondeado y capa de destino segun ese valor
        (setq area-redondeada (BS-RedondearArea area-real))
        (setq capa-destino    (BS-AsegurarCapa (BS-CapaPorArea area-real) doc))

        ;; Caja envolvente -> centro
        (vla-GetBoundingBox obj 'minPt 'maxPt)
        (setq minPt (vlax-safearray->list minPt))
        (setq maxPt (vlax-safearray->list maxPt))
        (setq centro
          (vlax-3d-point
            (list
              (/ (+ (car minPt) (car maxPt)) 2.0)
              (/ (+ (cadr minPt) (cadr maxPt)) 2.0)
              0.0
            )
          )
        )

        ;; Crear el texto SOLO con el numero (sin "m2")
        (setq texto
          (vla-AddText
            espacio
            (BS-FormatoArea area-redondeada)
            centro
            altura
          )
        )

        ;; Centrar horizontal y verticalmente (acAlignmentMiddleCenter = 10)
        (vla-put-Alignment texto 10)
        (vla-put-TextAlignmentPoint texto centro)

        ;; Colocar el texto en la capa que corresponde a su valor
        (vla-put-Layer texto capa-destino)

        (setq i (1+ i))
      )
      (princ
        (strcat
          "\nSe han generado "
          (itoa (sslength ss))
          " textos, cada uno en su capa segun el area."
        )
      )
    )
    (princ "\nNo se encontraron polilineas cerradas en esa capa.")
  )
  (princ)
)

(princ "\nComando AREASPOL cargado. Escribe AREASPOL para ejecutarlo.")
(princ)
