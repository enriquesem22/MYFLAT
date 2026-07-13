;;; ==========================================================================
;;; AREASPOL.lsp
;;; --------------------------------------------------------------------------
;;; Comando: AREASPOL
;;;
;;; Selecciona TODAS las polilineas cerradas (LWPOLYLINE) de una capa,
;;; calcula su superficie, la redondea segun la tabla Bluespace y coloca en el
;;; centro de cada una un TEXTO con el numero (sin "m2").
;;;
;;; La capa de las polilineas NO se escribe: se toma seleccionando un objeto
;;; de esa capa.
;;;
;;; Cada texto se coloca en una CAPA distinta segun el valor redondeado,
;;; siguiendo el mapa "boxs_texts_layer_names" del archivo config.yml.
;;; Si la capa de destino no existe, se crea automaticamente.
;;;
;;; Al terminar muestra un RESUMEN con cuantas polilineas hay de cada tamano.
;;;
;;; Uso:
;;;   1. En AutoCAD escribe:  APPLOAD  y carga este archivo.
;;;   2. Ejecuta el comando:  AREASPOL
;;;   3. Selecciona un objeto que este en la capa de las polilineas.
;;;   4. Indica la altura del texto (Enter = 0.25).
;;;
;;; Nota sobre unidades:
;;;   El codigo supone que el dibujo esta en METROS. Si dibujas en MILIMETROS,
;;;   descomenta la linea marcada mas abajo para dividir el area entre 1000000.
;;; ==========================================================================

;;; --------------------------------------------------------------------------
;;; Redondeo segun tabla Bluespace (box_target_areas)
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
    ((<= area 6.50)  "BS-62-M-6.0 sqm")
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
;;; Formato del numero: entero sin decimal (4), medio con un decimal (4.5)
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
;;; Incrementa el contador de 'clave' en una lista de asociacion (clave . n)
;;; --------------------------------------------------------------------------
(defun BS-Incrementar (clave lst)
  (if (assoc clave lst)
    (subst (cons clave (1+ (cdr (assoc clave lst)))) (assoc clave lst) lst)
    (cons (cons clave 1) lst)
  )
)

;;; --------------------------------------------------------------------------
;;; Rellena una cadena con espacios por la derecha hasta 'n' caracteres.
;;; --------------------------------------------------------------------------
(defun BS-Pad (s n)
  (while (< (strlen s) n) (setq s (strcat s " ")))
  s
)

;;; --------------------------------------------------------------------------
;;; Comando principal
;;; --------------------------------------------------------------------------
(defun c:AREASPOL
  (/ capa altura ss i obj area-real area-redondeada capa-destino conteo
     total ent minPt maxPt centro texto doc espacio orden)

  (vl-load-com)
  (setq doc (vla-get-ActiveDocument (vlax-get-acad-object)))
  (setq espacio
    (if (= 1 (getvar "CVPORT"))
      (vla-get-PaperSpace doc)
      (vla-get-ModelSpace doc)
    )
  )

  ;; Capa de las polilineas: se toma del objeto seleccionado
  (setq ent (entsel "\nSelecciona un objeto de la capa de las polilineas: "))
  (if (null ent)
    (progn
      (princ "\nNo se selecciono ningun objeto. Comando cancelado.")
      (exit)
    )
  )
  (setq capa (cdr (assoc 8 (entget (car ent)))))
  (princ (strcat "\nCapa seleccionada: " capa))

  ;; Altura del texto (Enter = 0.25)
  (setq altura (getdist "\nIndica la altura del texto <0.25>: "))
  (if (null altura)
    (setq altura 0.25)
  )

  ;; Seleccionar todas las polilineas cerradas de esa capa
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
      (setq i 0 conteo nil)
      (repeat (sslength ss)
        (setq obj (vlax-ename->vla-object (ssname ss i)))

        ;; Area geometrica real
        (setq area-real (vla-get-Area obj))
        ;; --- Si el dibujo esta en MILIMETROS, descomenta la linea siguiente: ---
        ;; (setq area-real (/ (vla-get-Area obj) 1000000.0))

        ;; Valor redondeado, capa de destino y conteo
        (setq area-redondeada (BS-RedondearArea area-real))
        (setq capa-destino    (BS-AsegurarCapa (BS-CapaPorArea area-real) doc))
        (setq conteo          (BS-Incrementar area-redondeada conteo))

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
          (vla-AddText espacio (BS-FormatoArea area-redondeada) centro altura)
        )
        (vla-put-Alignment texto 10)              ; acAlignmentMiddleCenter
        (vla-put-TextAlignmentPoint texto centro)
        (vla-put-Layer texto capa-destino)

        (setq i (1+ i))
      )

      ;; ---------- RESUMEN POR TAMANO ----------
      (setq orden
        '(1.0 1.5 2.0 2.5 3.0 3.5 4.0 4.5 5.0 6.0
          7.0 8.0 9.0 10.0 12.0 15.0 18.0 21.0 25.0)
      )
      (setq total 0)
      (princ "\n\n========= RESUMEN POR TAMANO =========")
      (foreach v orden
        (if (assoc v conteo)
          (progn
            (princ
              (strcat
                "\n  Tamano " (BS-Pad (BS-FormatoArea v) 5)
                " : " (itoa (cdr (assoc v conteo)))
              )
            )
            (setq total (+ total (cdr (assoc v conteo))))
          )
        )
      )
      (princ "\n  -----------------------------------")
      (princ (strcat "\n  TOTAL   : " (itoa total)))
      (princ "\n======================================")
    )
    (princ "\nNo se encontraron polilineas cerradas en esa capa.")
  )
  (princ)
)

(princ "\nComando AREASPOL cargado. Escribe AREASPOL para ejecutarlo.")
(princ)
