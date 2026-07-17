;;; ==========================================================================
;;; AREASPOL.lsp
;;; --------------------------------------------------------------------------
;;; Comando: AREASPOL
;;;
;;; Coloca en el centro de cada polilinea cerrada un TEXTO con su superficie
;;; redondeada (tabla Bluespace, sin "m2"), lleva cada texto a la CAPA que le
;;; corresponde segun el tamano (mapa boxs_texts_layer_names del config.yml) y
;;; genera una TABLA resumen dibujada en el plano al estilo "NUMBER OF UNITS".
;;;
;;; La tabla tiene:
;;;   Size | NUMBER OF UNITS (una columna por planta) | TOTAL UNITS |
;;;   TOTAL m2 | % Units size (por categoria) | Units (por categoria)
;;;   ...filas fijas mh 1.5/2.0/2.5 sin numeros...
;;;   ...una fila por tamano, agrupadas por categoria Small/Medium/Large/XLarge...
;;;   TOTAL ... y "box mix" (media = area total / nº piezas)
;;;
;;; Modos:
;;;   - Plantas : varias selecciones con titulo (+0 Floor, +1 Floor, ...).
;;;   - Todo    : todas las polilineas cerradas de una capa (una columna).
;;;
;;; Nota sobre unidades:
;;;   El codigo supone que el dibujo esta en METROS. Si dibujas en MILIMETROS,
;;;   descomenta la linea marcada mas abajo para dividir el area entre 1000000.
;;; ==========================================================================

;;; --------------------------------------------------------------------------
;;; Redondeo segun tabla Bluespace (box_target_areas)
;;; Areas < 0.85 m2 -> etiqueta 0 (piezas demasiado pequenas, para detectarlas).
;;; --------------------------------------------------------------------------
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
;;; Formato de m2: entero sin decimal, si no con un decimal (152.5).
;;; --------------------------------------------------------------------------
(defun BS-FormatoM2 (valor)
  (if (= valor (fix valor))
    (rtos valor 2 0)
    (rtos valor 2 1)
  )
)

;;; --------------------------------------------------------------------------
;;; Porcentaje entero (redondeado) de 'part' sobre 'total'.
;;; --------------------------------------------------------------------------
(defun BS-Pct (part total)
  (if (> total 0)
    (fix (+ 0.5 (/ (* 100.0 part) total)))
    0
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

;;; Cantidad de un tamano 'v' en un grupo 'g' (0 si no hay).
(defun BS-CntVG (v g / x)
  (if (setq x (cdr (assoc v (cdr g)))) x 0)
)

;;; Total de un tamano 'v' sumando todos los grupos.
(defun BS-SizeTotal (v grupos / s)
  (setq s 0)
  (foreach g grupos (setq s (+ s (BS-CntVG v g))))
  s
)

;;; Fusion de celdas protegida (por si la version no la soporta).
(defun BS-Merge (tabla r1 r2 c1 c2)
  (vl-catch-all-apply 'vla-MergeCells (list tabla r1 r2 c1 c2))
)

;;; Ancho de columna protegido.
(defun BS-SetCW (tabla i w)
  (vl-catch-all-apply 'vla-SetColumnWidth (list tabla i w))
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
;;; Dibuja la tabla resumen estilo "NUMBER OF UNITS".
;;;   grupos = lista de (nombre . conteo) -> una columna por planta.
;;; --------------------------------------------------------------------------
(defun BS-DibujarTabla (espacio grupos altura
                        / categorias mhrows ng ncol nData nfilas pt tabla
                          r c v cnt tot m2 catName sizes catStart catUnits
                          gtotales grandTotal totalArea cSize cFloor1 cUni cM2 cPct cUnits)
  ;; Categorias (tamanos por categoria, sin el 20)
  (setq categorias
    (list
      (list "Small"  '(1.0 1.5 2.0 2.5 3.0 3.5))
      (list "Medium" '(4.0 4.5 5.0 6.0 7.0 8.0 9.0))
      (list "Large"  '(10.0 12.0 15.0 18.0))
      (list "XLarge" '(21.0 25.0))
    )
  )
  (setq mhrows '("mh 1.5" "mh 2.0" "mh 2.5"))

  (setq ng (length grupos))
  ;; indices de columnas
  (setq cSize   0
        cFloor1 1
        cUni    (+ ng 1)     ; TOTAL UNITS
        cM2     (+ ng 2)     ; TOTAL m2
        cPct    (+ ng 3)     ; % Units size
        cUnits  (+ ng 4)     ; Units
        ncol    (+ ng 5))

  ;; Totales por grupo / gran total / area total
  ;; totales por grupo, excluyendo el tamano 0 (no cuenta en la tabla)
  (setq gtotales
    (mapcar
      '(lambda (g)
         (apply '+
           (cons 0
             (mapcar 'cdr
               (vl-remove-if '(lambda (p) (= (car p) 0.0)) (cdr g))))))
      grupos))
  (setq grandTotal (apply '+ (cons 0 gtotales)))
  (setq totalArea 0.0)
  (foreach cat categorias
    (foreach v (cadr cat)
      (setq totalArea (+ totalArea (* v (BS-SizeTotal v grupos))))))

  ;; nº de filas de datos (mh + tamanos visibles; el 0 solo si aparece)
  (setq nData (length mhrows))
  (foreach cat categorias
    (foreach v (cadr cat)
      (if (or (/= v 0.0) (> (BS-SizeTotal v grupos) 0))
        (setq nData (1+ nData)))))

  ;; filas totales = 1 titulo + 2 cabecera + datos + 1 TOTAL
  (setq nfilas (+ 3 nData 1))

  (setq pt (getpoint "\nIndica el punto de insercion de la tabla resumen: "))
  (if (null pt)
    (princ "\nNo se indico punto: no se dibujo la tabla.")
    (progn
      (setq tabla
        (vla-AddTable espacio (vlax-3d-point pt) nfilas ncol
                      (* altura 2.0) (* altura 6.0)))
      (vl-catch-all-apply 'vla-SetTextHeight (list tabla 7 altura))

      ;; anchos de columna
      (BS-SetCW tabla cSize (* altura 7.0))
      (setq c cFloor1)
      (repeat ng (BS-SetCW tabla c (* altura 6.0)) (setq c (1+ c)))
      (BS-SetCW tabla cUni   (* altura 6.0))
      (BS-SetCW tabla cM2    (* altura 6.0))
      (BS-SetCW tabla cPct   (* altura 6.0))
      (BS-SetCW tabla cUnits (* altura 6.0))

      ;; ---------- Cabecera ----------
      ;; Fila 0: titulo a todo lo ancho
      (BS-Merge tabla 0 0 0 (1- ncol))
      (vla-SetText tabla 0 0 "NUMBER OF UNITS BY SIZE")
      ;; Fila 1-2: cabecera agrupada
      (BS-Merge tabla 1 2 cSize cSize)          (vla-SetText tabla 1 cSize "Size")
      (BS-Merge tabla 1 1 cFloor1 ng)           (vla-SetText tabla 1 cFloor1 "NUMBER OF UNITS")
      (BS-Merge tabla 1 2 cUni cUni)            (vla-SetText tabla 1 cUni "TOTAL UNITS")
      (BS-Merge tabla 1 2 cM2 cM2)              (vla-SetText tabla 1 cM2 "TOTAL m2")
      (BS-Merge tabla 1 2 cPct cPct)            (vla-SetText tabla 1 cPct "% Units size")
      (BS-Merge tabla 1 2 cUnits cUnits)        (vla-SetText tabla 1 cUnits "Units")
      ;; Fila 2: nombres de planta
      (setq c cFloor1)
      (foreach g grupos (vla-SetText tabla 2 c (car g)) (setq c (1+ c)))

      ;; ---------- Filas mh (sin numeros) ----------
      (setq r 3)
      (foreach mh mhrows
        (vla-SetText tabla r cSize mh)
        (setq c cFloor1)
        (repeat ng (vla-SetText tabla r c "-") (setq c (1+ c)))
        (vla-SetText tabla r cUni "-")
        (vla-SetText tabla r cM2  "-")
        (setq r (1+ r)))
      ;; % y Units de mh fusionados y en blanco
      (BS-Merge tabla 3 (1- r) cPct cPct)   (vla-SetText tabla 3 cPct "-")
      (BS-Merge tabla 3 (1- r) cUnits cUnits) (vla-SetText tabla 3 cUnits "-")

      ;; ---------- Filas por categoria ----------
      (foreach cat categorias
        (setq catName (car cat) sizes (cadr cat))
        (setq catStart r catUnits 0)
        (foreach v sizes
          (if (or (/= v 0.0) (> (BS-SizeTotal v grupos) 0))
            (progn
              (vla-SetText tabla r cSize (BS-FormatoArea v))
              (setq c cFloor1 tot 0)
              (foreach g grupos
                (setq cnt (BS-CntVG v g))
                (vla-SetText tabla r c (itoa cnt))
                (setq tot (+ tot cnt))
                (setq c (1+ c)))
              (vla-SetText tabla r cUni (itoa tot))
              (setq m2 (* v tot))
              (vla-SetText tabla r cM2 (BS-FormatoM2 m2))
              (setq catUnits (+ catUnits tot))
              (setq r (1+ r)))))
        ;; % y Units de la categoria fusionados
        (if (> r catStart)
          (progn
            (BS-Merge tabla catStart (1- r) cPct cPct)
            (vla-SetText tabla catStart cPct
              (strcat (itoa (BS-Pct catUnits grandTotal)) "%"))
            (BS-Merge tabla catStart (1- r) cUnits cUnits)
            (vla-SetText tabla catStart cUnits (itoa catUnits)))))

      ;; ---------- Fila TOTAL ----------
      (vla-SetText tabla r cSize "TOTAL")
      (setq c cFloor1)
      (foreach gt gtotales (vla-SetText tabla r c (itoa gt)) (setq c (1+ c)))
      (vla-SetText tabla r cUni (itoa grandTotal))
      (vla-SetText tabla r cM2  (BS-FormatoM2 totalArea))
      ;; box mix = area total / nº piezas
      (BS-Merge tabla r r cPct cUnits)
      (vla-SetText tabla r cPct
        (if (> grandTotal 0)
          (strcat (rtos (/ totalArea grandTotal) 2 2) " box mix")
          "-"))

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
          (getstring T "\nTitulo de la seleccion (+0 Floor, +1 Floor...) o Enter para terminar: ")
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
