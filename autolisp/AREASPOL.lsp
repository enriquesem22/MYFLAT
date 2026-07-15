;;; ==========================================================================
;;; AREASPOL.lsp
;;; --------------------------------------------------------------------------
;;; Comando: AREASPOL
;;;
;;; Coloca en el centro de cada polilinea cerrada un TEXTO con su superficie
;;; redondeada (tabla Bluespace, sin "m2"), lleva cada texto a la CAPA que le
;;; corresponde segun el tamano (mapa boxs_texts_layer_names del config.yml) y
;;; genera una TABLA resumen dibujada en el plano.
;;;
;;; Modos:
;;;   - Plantas : vas haciendo varias selecciones y a cada una le pones un
;;;               titulo (P00, P01, ...). Cada seleccion es una columna de la
;;;               tabla; ademas se calcula la columna TOTAL y la columna M2.
;;;   - Todo    : todas las polilineas cerradas de una capa (una sola columna).
;;;
;;; La tabla incluye:
;;;   Tamano | <P00> | <P01> | ... | TOTAL | M2
;;;   ...una fila por tamano...
;;;   TOTAL  | sumas por columna ... | total | area total
;;;   MID SIZE | ... | media (area total / nº piezas)
;;;
;;; Uso:
;;;   1. En AutoCAD escribe:  APPLOAD  y carga este archivo.
;;;   2. Ejecuta el comando:  AREASPOL
;;;
;;; Nota sobre unidades:
;;;   El codigo supone que el dibujo esta en METROS. Si dibujas en MILIMETROS,
;;;   descomenta la linea marcada mas abajo para dividir el area entre 1000000.
;;; ==========================================================================

;;; --------------------------------------------------------------------------
;;; Redondeo segun tabla Bluespace (box_target_areas)
;;; --------------------------------------------------------------------------
;;; Areas < 0.85 m2 -> etiqueta 0 (piezas demasiado pequenas, para detectarlas).
(defun BS-RedondearArea (area)
  (cond
    ((< area 0.85)   0.0)
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
    ((< area 0.85)   "BS-61-S-0.0 sqm")
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
;;; Formato del tamano: entero sin decimal (4), medio con un decimal (4.5)
;;; --------------------------------------------------------------------------
(defun BS-FormatoArea (area)
  (if (= area (fix area))
    (rtos area 2 0)
    (rtos area 2 1)
  )
)

;;; --------------------------------------------------------------------------
;;; Formato de la columna M2 (tamano * cantidad):
;;;   si el tamano es entero -> 0 decimales; si es medio -> 4 decimales
;;;   (para reproducir el estilo de la tabla de referencia).
;;; --------------------------------------------------------------------------
(defun BS-FormatoM2 (tamano valor)
  (if (= tamano (fix tamano))
    (rtos valor 2 0)
    (rtos valor 2 4)
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
;;; Incrementa el contador de 'clave' en una lista (clave . n)
;;; --------------------------------------------------------------------------
(defun BS-Incrementar (clave lst)
  (if (assoc clave lst)
    (subst (cons clave (1+ (cdr (assoc clave lst)))) (assoc clave lst) lst)
    (cons (cons clave 1) lst)
  )
)

;;; --------------------------------------------------------------------------
;;; Procesa un conjunto de seleccion:
;;;   - coloca los textos de area en la capa correspondiente
;;;   - devuelve la lista de conteo (tamano . cantidad)
;;; --------------------------------------------------------------------------
(defun BS-ProcesarSS (ss espacio doc altura
                      / i obj area-real vr conteo minPt maxPt centro texto capa-destino)
  (setq i 0 conteo nil)
  (repeat (sslength ss)
    (setq obj (vlax-ename->vla-object (ssname ss i)))

    ;; Area geometrica real
    (setq area-real (vla-get-Area obj))
    ;; --- Si el dibujo esta en MILIMETROS, descomenta la linea siguiente: ---
    ;; (setq area-real (/ (vla-get-Area obj) 1000000.0))

    (setq vr (BS-RedondearArea area-real))
    (setq capa-destino (BS-AsegurarCapa (BS-CapaPorArea area-real) doc))
    (setq conteo (BS-Incrementar vr conteo))

    ;; Centro de la caja envolvente
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

    ;; Texto solo con el numero (sin "m2")
    (setq texto (vla-AddText espacio (BS-FormatoArea vr) centro altura))
    (vla-put-Alignment texto 10)              ; acAlignmentMiddleCenter
    (vla-put-TextAlignmentPoint texto centro)
    (vla-put-Layer texto capa-destino)

    (setq i (1+ i))
  )
  conteo
)

;;; --------------------------------------------------------------------------
;;; Dibuja la tabla resumen.
;;;   grupos = lista de (nombre . conteo) en el orden de las columnas.
;;; --------------------------------------------------------------------------
(defun BS-DibujarTabla (espacio grupos altura
                        / orden present ng ncol pt tabla nfilas r gi ci
                          gtotales grandTotal totalArea cnt tot m2)
  (setq orden
    '(0.0 1.0 1.5 2.0 2.5 3.0 3.5 4.0 4.5 5.0 6.0
      7.0 8.0 9.0 10.0 12.0 15.0 18.0 21.0 25.0)
  )
  ;; tamanos que aparecen en algun grupo
  (setq present nil)
  (foreach v orden
    (if (vl-some '(lambda (g) (assoc v (cdr g))) grupos)
      (setq present (cons v present))
    )
  )
  (setq present (reverse present))

  (setq ng (length grupos))
  (setq ncol (+ ng 3))                    ; Tamano + grupos + TOTAL + M2
  ;; totales por grupo (nº de piezas de cada columna)
  (setq gtotales
    (mapcar '(lambda (g) (apply '+ (cons 0 (mapcar 'cdr (cdr g))))) grupos)
  )
  (setq grandTotal (apply '+ (cons 0 gtotales)))

  (setq pt (getpoint "\nIndica el punto de insercion de la tabla resumen: "))
  (if (null pt)
    (princ "\nNo se indico punto: no se dibujo la tabla.")
    (progn
      ;; filas: titulo + cabecera + tamanos + TOTAL + MID SIZE
      (setq nfilas (+ (length present) 4))
      (setq tabla
        (vla-AddTable espacio (vlax-3d-point pt) nfilas ncol
                      (* altura 2.0) (* altura 8.0))
      )
      (vl-catch-all-apply 'vla-SetTextHeight (list tabla 7 altura))  ; 1+2+4 todas

      ;; anchos de columna
      (vl-catch-all-apply 'vla-SetColumnWidth (list tabla 0 (* altura 7.0)))
      (setq ci 1)
      (repeat ng
        (vl-catch-all-apply 'vla-SetColumnWidth (list tabla ci (* altura 6.0)))
        (setq ci (1+ ci))
      )
      (vl-catch-all-apply 'vla-SetColumnWidth (list tabla ci (* altura 7.0)))       ; TOTAL
      (vl-catch-all-apply 'vla-SetColumnWidth (list tabla (1+ ci) (* altura 9.0)))  ; M2

      ;; --- Titulo (fila 0, se fusiona sola) ---
      (vla-SetText tabla 0 0 "RESUMEN DE SUPERFICIES")

      ;; --- Cabecera (fila 1) ---
      (vla-SetText tabla 1 0 "Tamano")
      (setq gi 0)
      (foreach g grupos
        (vla-SetText tabla 1 (+ 1 gi) (car g))
        (setq gi (1+ gi))
      )
      (vla-SetText tabla 1 (+ 1 ng) "TOTAL")
      (vla-SetText tabla 1 (+ 2 ng) "M2")

      ;; --- Filas de datos ---
      (setq r 2 totalArea 0.0)
      (foreach v present
        (vla-SetText tabla r 0 (BS-FormatoArea v))
        (setq gi 0 tot 0)
        (foreach g grupos
          (setq cnt (cdr (assoc v (cdr g))))
          (if (null cnt) (setq cnt 0))
          (if (> cnt 0)                       ; en blanco si es 0
            (vla-SetText tabla r (+ 1 gi) (itoa cnt))
          )
          (setq tot (+ tot cnt))
          (setq gi (1+ gi))
        )
        (vla-SetText tabla r (+ 1 ng) (itoa tot))
        (setq m2 (* v tot))
        (setq totalArea (+ totalArea m2))
        (vla-SetText tabla r (+ 2 ng) (BS-FormatoM2 v m2))
        (setq r (1+ r))
      )

      ;; --- Fila TOTAL ---
      (vla-SetText tabla r 0 "TOTAL")
      (setq gi 0)
      (foreach gt gtotales
        (vla-SetText tabla r (+ 1 gi) (itoa gt))
        (setq gi (1+ gi))
      )
      (vla-SetText tabla r (+ 1 ng) (itoa grandTotal))
      (vla-SetText tabla r (+ 2 ng) (rtos totalArea 2 4))
      (setq r (1+ r))

      ;; --- Fila MID SIZE (media = area total / nº piezas) ---
      (vla-SetText tabla r 0 "MID SIZE")
      (if (> grandTotal 0)
        (vla-SetText tabla r (+ 1 ng) (rtos (/ totalArea grandTotal) 2 4))
      )

      (princ (strcat "\nTabla creada. Total de piezas: " (itoa grandTotal)))
    )
  )
)

;;; --------------------------------------------------------------------------
;;; Comando principal
;;; --------------------------------------------------------------------------
(defun c:AREASPOL
  (/ modo altura grupos nombre ss conteo ent capa seguir doc espacio)

  (vl-load-com)
  (setq doc (vla-get-ActiveDocument (vlax-get-acad-object)))
  (setq espacio
    (if (= 1 (getvar "CVPORT"))
      (vla-get-PaperSpace doc)
      (vla-get-ModelSpace doc)
    )
  )

  ;; Modo
  (initget "Plantas Todo")
  (setq modo (getkword "\nModo [Plantas/Todo] <Plantas>: "))
  (if (null modo) (setq modo "Plantas"))

  ;; Altura del texto
  (setq altura (getdist "\nIndica la altura del texto <0.25>: "))
  (if (null altura) (setq altura 0.25))

  (setq grupos nil)

  (if (= modo "Todo")
    ;; ---------- TODO: una sola columna con toda la capa ----------
    (progn
      (setq ent (entsel "\nSelecciona un objeto de la capa de las polilineas: "))
      (if (null ent)
        (progn (princ "\nNada seleccionado. Comando cancelado.") (exit))
      )
      (setq capa (cdr (assoc 8 (entget (car ent)))))
      (princ (strcat "\nCapa: " capa))
      (setq ss
        (ssget "_X"
          (list '(0 . "LWPOLYLINE") (cons 8 capa) '(-4 . "&") '(70 . 1))
        )
      )
      (if ss
        (setq grupos (list (cons capa (BS-ProcesarSS ss espacio doc altura))))
        (princ "\nNo se encontraron polilineas cerradas en esa capa.")
      )
    )
    ;; ---------- PLANTAS: varias selecciones con titulo ----------
    (progn
      (princ "\nVe seleccionando por plantas. Deja el titulo VACIO para terminar.")
      (setq seguir T)
      (while seguir
        (setq nombre
          (getstring T "\nTitulo de la seleccion (P00, P01...) o Enter para terminar: ")
        )
        (if (= nombre "")
          (setq seguir nil)
          (progn
            (princ (strcat "\nSelecciona las polilineas de '" nombre "': "))
            (setq ss (ssget (list '(0 . "LWPOLYLINE") '(-4 . "&") '(70 . 1))))
            (if ss
              (progn
                (setq conteo (BS-ProcesarSS ss espacio doc altura))
                (setq grupos (cons (cons nombre conteo) grupos))
                (princ
                  (strcat "\n  '" nombre "': " (itoa (sslength ss)) " polilineas anadidas.")
                )
              )
              (princ "\n  Seleccion vacia: no se anade este grupo.")
            )
          )
        )
      )
      (setq grupos (reverse grupos))
    )
  )

  ;; Dibujar la tabla si hay datos
  (if grupos
    (BS-DibujarTabla espacio grupos altura)
    (princ "\nNo hay datos: no se genera tabla.")
  )
  (princ)
)

(princ "\nComando AREASPOL cargado. Escribe AREASPOL para ejecutarlo.")
(princ)
